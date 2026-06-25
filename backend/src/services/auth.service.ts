import { createHash, randomBytes } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import type { User } from '@prisma/client';
import { prisma, withDbRetry } from '../lib/prisma';
import { ApiException } from '../lib/api-exception';
import { isIpReverification, needsEmailVerification } from '../auth/email-verification.policy';
import { toUserDto, type UserDto } from '../auth/user.mapper';
import { signToken } from '../middleware/auth.middleware';
import { mailService } from './mail.service';
import { usersService } from './users.service';
import { getCountryFromIp } from '../lib/country-from-ip';
import type { z } from 'zod';
import type {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  resendVerificationSchema,
  verifyEmailSchema,
} from '../schemas/auth.schemas';

const BCRYPT_ROUNDS = 12;
const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const VERIFY_TOKEN_BYTES = 32;
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

const isNonProduction = process.env.NODE_ENV !== 'production';

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;
type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

export const authService = {
  async checkUsernameAvailability(username: string): Promise<{ available: boolean }> {
    const available = await usersService.isUsernameAvailable(username);
    return { available };
  },

  async checkEmailAvailability(email: string): Promise<{ available: boolean }> {
    const available = await usersService.isEmailAvailable(email);
    return { available };
  },

  async register(
    dto: RegisterInput,
    clientIp: string,
    country: string | null = getCountryFromIp(clientIp),
  ): Promise<{
    message: string;
    email: string;
    devVerificationUrl?: string;
  }> {
    const email = dto.email.toLowerCase();
    const username = dto.username.toLowerCase();

    const existing = await usersService.findByEmail(email);
    if (existing) {
      if (!existing.emailVerifiedAt || needsEmailVerification(existing, clientIp)) {
        throw new ApiException(
          'EMAIL_PENDING_VERIFICATION',
          'This email is registered but not verified. Check your inbox or resend the verification email.',
          409,
        );
      }
      throw new ApiException('EMAIL_EXISTS', 'Email already registered', 409);
    }

    if (!(await usersService.isUsernameAvailable(username))) {
      throw new ApiException('USERNAME_EXISTS', 'Username is already taken', 409);
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await withDbRetry(() =>
      usersService.createWithEmailAuth({
        email,
        username,
        displayName: dto.displayName,
        passwordHash,
        emailVerifiedAt: null,
        registrationIp: clientIp,
        country,
      }),
    );

    const verifyUrl = await this.issueVerificationToken(user.id, user.email);

    const response: { message: string; email: string; devVerificationUrl?: string } = {
      message: 'Verification email sent. Please check your inbox to activate your account.',
      email: user.email,
    };

    if (isNonProduction) {
      response.devVerificationUrl = verifyUrl;
    }

    return response;
  },

  async verifyEmail(
    dto: VerifyEmailInput,
    clientIp: string,
  ): Promise<{ user: UserDto; token: string; message: string }> {
    return withDbRetry(async () => {
      const tokenHash = hashToken(dto.token);
      const record = await prisma.emailVerificationToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });

      if (!record || record.usedAt || record.expiresAt < new Date()) {
        throw new ApiException('INVALID_VERIFY_TOKEN', 'Invalid or expired verification link', 400);
      }

      const user = record.user;
      const wasVerified = Boolean(user.emailVerifiedAt);

      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerifiedAt: new Date(),
            verifiedIp: clientIp,
          },
        }),
        prisma.emailVerificationToken.update({
          where: { id: record.id },
          data: { usedAt: new Date() },
        }),
        prisma.emailVerificationToken.updateMany({
          where: { userId: user.id, usedAt: null },
          data: { usedAt: new Date() },
        }),
        ...(!wasVerified
          ? [
              prisma.notification.create({
                data: {
                  userId: user.id,
                  type: 'system',
                  title: 'Welcome to Tipster Arena',
                  message:
                    'Your email is verified. You received 1,000,000 virtual credits — start placing bets on upcoming fixtures!',
                  link: '/',
                },
              }),
            ]
          : []),
      ]);

      const updated = await usersService.findById(user.id);
      if (!updated) {
        throw new ApiException('NOT_FOUND', 'User not found', 404);
      }

      return {
        user: toUserDto(updated),
        token: signToken(updated),
        message: wasVerified
          ? 'Email verified for this location. You can sign in now.'
          : 'Email verified successfully. Welcome to Tipster Arena!',
      };
    });
  },

  async resendVerification(
    dto: ResendVerificationInput,
    clientIp: string,
  ): Promise<{
    message: string;
    devVerificationUrl?: string;
  }> {
    const user = await usersService.findByEmail(dto.email);
    if (!user) {
      return { message: 'If the email is registered and unverified, a new link has been sent.' };
    }

    if (!user.passwordHash) {
      return { message: 'If the email is registered and unverified, a new link has been sent.' };
    }

    if (!needsEmailVerification(user, clientIp)) {
      return { message: 'If the email is registered and unverified, a new link has been sent.' };
    }

    const verifyUrl = await this.issueVerificationToken(user.id, user.email);

    const response: { message: string; devVerificationUrl?: string } = {
      message: 'If the email is registered and unverified, a new link has been sent.',
    };

    if (isNonProduction) {
      response.devVerificationUrl = verifyUrl;
    }

    return response;
  },

  async login(
    dto: LoginInput,
    clientIp: string,
  ): Promise<
    | { user: UserDto; token: string }
    | {
        requiresTwoFactor: true;
        twoFactorSession: string;
        method: 'authenticator' | 'phone';
        phoneNumberMasked: string | null;
      }
  > {
    return withDbRetry(async () => {
      const user = await usersService.findByEmail(dto.email);
      if (!user) {
        throw new ApiException('INVALID_CREDENTIALS', 'Invalid email or password', 401);
      }

      if (!user.passwordHash) {
        throw new ApiException(
          'INVALID_CREDENTIALS',
          'Sign in with Google or set a password first',
          401,
        );
      }

      const valid = await bcrypt.compare(dto.password, user.passwordHash);
      if (!valid) {
        throw new ApiException('INVALID_CREDENTIALS', 'Invalid email or password', 401);
      }

      if (user.isBanned) {
        throw new ApiException('ACCOUNT_BANNED', 'This account has been suspended', 403);
      }

      if (user.role !== 'ADMIN' && needsEmailVerification(user, clientIp)) {
        if (isIpReverification(user, clientIp)) {
          void this.issueVerificationToken(user.id, user.email).catch((error) => {
            console.error('[auth] Failed to issue IP reverification token:', error);
          });
          throw new ApiException(
            'IP_VERIFICATION_REQUIRED',
            'You are signing in from a new location. Verify your email again to continue.',
            403,
          );
        }

        throw new ApiException(
          'EMAIL_NOT_VERIFIED',
          'Please verify your email before signing in. Check your inbox for the verification link.',
          403,
        );
      }

      const { twoFactorService } = await import('./two-factor.service');
      const twoFactor =
        user.role === 'ADMIN'
          ? { required: false as const }
          : await twoFactorService.loginRequiresTwoFactor(user.id, dto.trustToken);
      if (twoFactor.required) {
        const challenge = await twoFactorService.beginLoginChallenge(user.id);
        return {
          requiresTwoFactor: true,
          twoFactorSession: challenge.twoFactorSession,
          method: challenge.method,
          phoneNumberMasked: challenge.phoneNumberMasked,
        };
      }

      return {
        user: toUserDto(user),
        token: signToken(user),
      };
    });
  },

  async forgotPassword(dto: ForgotPasswordInput): Promise<{ message: string }> {
    const user = await usersService.findByEmail(dto.email);
    if (user) {
      const rawToken = randomBytes(RESET_TOKEN_BYTES).toString('base64url');
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

      await prisma.$transaction([
        prisma.passwordResetToken.updateMany({
          where: { userId: user.id, usedAt: null },
          data: { usedAt: new Date() },
        }),
        prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash,
            expiresAt,
          },
        }),
      ]);

      const resetUrl = `${getFrontendUrl()}/auth/reset-password?token=${encodeURIComponent(rawToken)}`;
      void mailService.sendPasswordResetEmail(user.email, resetUrl).catch((error) => {
        console.error('[auth] Failed to send password reset email:', error);
      });
    }

    return { message: 'Reset link sent if email exists' };
  },

  async resetPassword(dto: ResetPasswordInput): Promise<{ message: string }> {
    const tokenHash = hashToken(dto.token);
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new ApiException('INVALID_RESET_TOKEN', 'Invalid or expired reset token', 400);
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Password reset successful' };
  },

  me(user: User): UserDto {
    return toUserDto(user);
  },

  async issueVerificationToken(userId: string, email: string): Promise<string> {
    const rawToken = randomBytes(VERIFY_TOKEN_BYTES).toString('base64url');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);

    await withDbRetry(() =>
      prisma.$transaction([
        prisma.emailVerificationToken.updateMany({
          where: { userId, usedAt: null },
          data: { usedAt: new Date() },
        }),
        prisma.emailVerificationToken.create({
          data: {
            userId,
            tokenHash,
            expiresAt,
          },
        }),
      ]),
    );

    const verifyUrl = `${getFrontendUrl()}/auth/verify-email?token=${encodeURIComponent(rawToken)}`;
    void mailService.sendVerificationEmail(email, verifyUrl).catch((error) => {
      console.error('[auth] Failed to send verification email:', error);
    });
    return verifyUrl;
  },
};

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function getFrontendUrl(): string {
  return (process.env.FRONTEND_URL ?? 'http://localhost:5173').replace(/\/$/, '');
}
