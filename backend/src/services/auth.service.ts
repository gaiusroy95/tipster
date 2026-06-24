import { createHash, randomBytes } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import type { User } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ApiException } from '../lib/api-exception';
import { toUserDto, type UserDto } from '../auth/user.mapper';
import { signToken } from '../middleware/auth.middleware';
import { mailService } from './mail.service';
import { usersService } from './users.service';
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

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;
type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

export const authService = {
  async register(dto: RegisterInput): Promise<{
    message: string;
    email: string;
    devVerificationUrl?: string;
  }> {
    const email = dto.email.toLowerCase();

    const existing = await usersService.findByEmail(email);
    if (existing) {
      if (!existing.emailVerifiedAt) {
        throw new ApiException(
          'EMAIL_PENDING_VERIFICATION',
          'This email is registered but not verified. Check your inbox or resend the verification email.',
          409,
        );
      }
      throw new ApiException('EMAIL_EXISTS', 'Email already registered', 409);
    }

    if (await usersService.findByUsername(dto.username)) {
      throw new ApiException('USERNAME_EXISTS', 'Username is already taken', 409);
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await usersService.createWithEmailAuth({
      email,
      username: dto.username,
      displayName: dto.displayName,
      passwordHash,
      emailVerifiedAt: null,
    });

    const verifyUrl = await this.issueVerificationToken(user.id, user.email);

    const response: { message: string; email: string; devVerificationUrl?: string } = {
      message: 'Verification email sent. Please check your inbox to activate your account.',
      email: user.email,
    };

    if (process.env.NODE_ENV === 'development' && !mailService.isConfigured()) {
      response.devVerificationUrl = verifyUrl;
    }

    return response;
  },

  async verifyEmail(dto: VerifyEmailInput): Promise<{ user: UserDto; token: string; message: string }> {
    const tokenHash = hashToken(dto.token);
    const record = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new ApiException('INVALID_VERIFY_TOKEN', 'Invalid or expired verification link', 400);
    }

    const user = record.user;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: user.emailVerifiedAt ?? new Date() },
      }),
      prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      prisma.emailVerificationToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      }),
    ]);

    const updated = await usersService.findById(user.id);
    if (!updated) {
      throw new ApiException('NOT_FOUND', 'User not found', 404);
    }

    return {
      user: toUserDto(updated),
      token: signToken(updated.id),
      message: 'Email verified successfully. Welcome to Tipster Arena!',
    };
  },

  async resendVerification(dto: ResendVerificationInput): Promise<{
    message: string;
    devVerificationUrl?: string;
  }> {
    const user = await usersService.findByEmail(dto.email);
    if (!user) {
      return { message: 'If the email is registered and unverified, a new link has been sent.' };
    }

    if (user.emailVerifiedAt) {
      return { message: 'If the email is registered and unverified, a new link has been sent.' };
    }

    if (!user.passwordHash) {
      return { message: 'If the email is registered and unverified, a new link has been sent.' };
    }

    const verifyUrl = await this.issueVerificationToken(user.id, user.email);

    const response: { message: string; devVerificationUrl?: string } = {
      message: 'If the email is registered and unverified, a new link has been sent.',
    };

    if (process.env.NODE_ENV === 'development' && !mailService.isConfigured()) {
      response.devVerificationUrl = verifyUrl;
    }

    return response;
  },

  async login(dto: LoginInput): Promise<{ user: UserDto; token: string }> {
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

    if (!user.emailVerifiedAt) {
      throw new ApiException(
        'EMAIL_NOT_VERIFIED',
        'Please verify your email before signing in. Check your inbox for the verification link.',
        403,
      );
    }

    return {
      user: toUserDto(user),
      token: signToken(user.id),
    };
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
      await mailService.sendPasswordResetEmail(user.email, resetUrl);
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

    await prisma.$transaction([
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
    ]);

    const verifyUrl = `${getFrontendUrl()}/auth/verify-email?token=${encodeURIComponent(rawToken)}`;
    await mailService.sendVerificationEmail(email, verifyUrl);
    return verifyUrl;
  },
};

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function getFrontendUrl(): string {
  return (process.env.FRONTEND_URL ?? 'http://localhost:5173').replace(/\/$/, '');
}
