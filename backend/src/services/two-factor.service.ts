import { createHash, randomBytes, randomInt } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import { prisma } from '../lib/prisma';
import { ApiException } from '../lib/api-exception';
import { toUserDto, type UserDto } from '../auth/user.mapper';
import { signToken } from '../middleware/auth.middleware';
import { settingsService } from './settings.service';
import * as bcrypt from 'bcrypt';

const APP_NAME = 'Tipster Arena';
const TWO_FACTOR_SESSION_TTL_MS = 5 * 60 * 1000;
const TRUST_DEVICE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PHONE_CODE_TTL_MS = 10 * 60 * 1000;

export type TwoFactorMethod = 'authenticator' | 'phone';

authenticator.options = { window: 1 };

function getJwtSecret(): string {
  return process.env.JWT_SECRET ?? 'dev-jwt-secret-change-me';
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function hashPhoneCode(code: string): string {
  return hashToken(code);
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return phone;
  return `•••• ${digits.slice(-4)}`;
}

function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  if (!/^\+[1-9]\d{7,14}$/.test(trimmed)) {
    throw new ApiException('INVALID_PHONE', 'Enter a valid phone number in E.164 format (e.g. +15551234567)', 400);
  }
  return trimmed;
}

function signTwoFactorSession(userId: string): string {
  return jwt.sign({ sub: userId, purpose: '2fa_login' }, getJwtSecret(), {
    expiresIn: '5m',
  });
}

function verifyTwoFactorSession(session: string): string {
  try {
    const payload = jwt.verify(session, getJwtSecret()) as { sub: string; purpose?: string };
    if (payload.purpose !== '2fa_login') {
      throw new ApiException('INVALID_2FA_SESSION', 'Two-factor session expired. Sign in again.', 401);
    }
    return payload.sub;
  } catch {
    throw new ApiException('INVALID_2FA_SESSION', 'Two-factor session expired. Sign in again.', 401);
  }
}

function toStatus(settings: {
  twoFactorEnabled: boolean;
  twoFactorMethod: string | null;
  phoneNumber: string | null;
}) {
  return {
    twoFactorEnabled: settings.twoFactorEnabled,
    twoFactorMethod: (settings.twoFactorMethod as TwoFactorMethod | null) ?? null,
    phoneNumberMasked: settings.phoneNumber ? maskPhone(settings.phoneNumber) : null,
  };
}

async function verifyTotp(secret: string, code: string): Promise<boolean> {
  return authenticator.check(code.replace(/\s/g, ''), secret);
}

async function verifyUserCode(
  userId: string,
  code: string,
  settings: {
    twoFactorEnabled: boolean;
    twoFactorMethod: string | null;
    twoFactorSecret: string | null;
    phoneNumber: string | null;
  },
  purpose: 'setup' | 'login' | 'disable',
): Promise<void> {
  const normalized = code.replace(/\s/g, '');
  if (!/^\d{6}$/.test(normalized)) {
    throw new ApiException('INVALID_2FA_CODE', 'Enter a valid 6-digit code', 400);
  }

  if (settings.twoFactorMethod === 'authenticator') {
    const secret =
      purpose === 'setup'
        ? settings.twoFactorSecret ?? (await settingsService.getOrCreate(userId)).twoFactorPendingSecret
        : settings.twoFactorSecret;
    if (!secret || !(await verifyTotp(secret, normalized))) {
      throw new ApiException('INVALID_2FA_CODE', 'Invalid authenticator code', 400);
    }
    return;
  }

  if (settings.twoFactorMethod === 'phone') {
    const record = await prisma.twoFactorPhoneCode.findFirst({
      where: {
        userId,
        purpose,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!record || record.codeHash !== hashPhoneCode(normalized)) {
      throw new ApiException('INVALID_2FA_CODE', 'Invalid verification code', 400);
    }
    await prisma.twoFactorPhoneCode.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });
    return;
  }

  throw new ApiException('TWO_FACTOR_NOT_CONFIGURED', 'Two-factor authentication is not configured', 400);
}

async function issuePhoneCode(
  userId: string,
  phoneNumber: string,
  purpose: 'setup' | 'login' | 'disable',
): Promise<void> {
  const code = String(randomInt(100000, 999999));
  const expiresAt = new Date(Date.now() + PHONE_CODE_TTL_MS);

  await prisma.twoFactorPhoneCode.updateMany({
    where: { userId, purpose, usedAt: null },
    data: { usedAt: new Date() },
  });

  await prisma.twoFactorPhoneCode.create({
    data: {
      userId,
      phoneNumber,
      codeHash: hashPhoneCode(code),
      purpose,
      expiresAt,
    },
  });

  console.log(`[2fa] Phone verification code for ${phoneNumber} (${purpose}): ${code}`);
}

export const twoFactorService = {
  getStatus(userId: string) {
    return settingsService.getOrCreate(userId).then(toStatus);
  },

  async beginAuthenticatorSetup(userId: string, email: string) {
    const settings = await settingsService.getOrCreate(userId);
    if (settings.twoFactorEnabled) {
      throw new ApiException('TWO_FACTOR_ALREADY_ENABLED', 'Two-factor authentication is already enabled', 409);
    }

    const secret = authenticator.generateSecret();
    await prisma.userSettings.update({
      where: { userId },
      data: { twoFactorPendingSecret: secret },
    });

    const otpauthUrl = authenticator.keyuri(email, APP_NAME, secret);

    return {
      secret,
      otpauthUrl,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`,
    };
  },

  async confirmAuthenticatorSetup(userId: string, code: string) {
    const settings = await settingsService.getOrCreate(userId);
    if (!settings.twoFactorPendingSecret) {
      throw new ApiException('TWO_FACTOR_SETUP_REQUIRED', 'Start authenticator setup first', 400);
    }

    if (!(await verifyTotp(settings.twoFactorPendingSecret, code))) {
      throw new ApiException('INVALID_2FA_CODE', 'Invalid authenticator code', 400);
    }

    await prisma.userSettings.update({
      where: { userId },
      data: {
        twoFactorEnabled: true,
        twoFactorMethod: 'authenticator',
        twoFactorSecret: settings.twoFactorPendingSecret,
        twoFactorPendingSecret: null,
        phoneNumber: null,
        phoneVerifiedAt: null,
      },
    });

    return { message: 'Authenticator app enabled for two-factor authentication' };
  },

  async beginPhoneSetup(userId: string, phoneNumber: string) {
    const settings = await settingsService.getOrCreate(userId);
    if (settings.twoFactorEnabled) {
      throw new ApiException('TWO_FACTOR_ALREADY_ENABLED', 'Two-factor authentication is already enabled', 409);
    }

    const normalized = normalizePhone(phoneNumber);
    await prisma.userSettings.update({
      where: { userId },
      data: {
        phoneNumber: normalized,
        phoneVerifiedAt: null,
        twoFactorPendingSecret: null,
      },
    });

    await issuePhoneCode(userId, normalized, 'setup');

    return {
      message: 'Verification code sent',
      phoneNumberMasked: maskPhone(normalized),
      devCodeHint: process.env.NODE_ENV !== 'production' ? 'Check server console for the SMS code' : undefined,
    };
  },

  async confirmPhoneSetup(userId: string, code: string) {
    const settings = await settingsService.getOrCreate(userId);
    if (!settings.phoneNumber) {
      throw new ApiException('TWO_FACTOR_SETUP_REQUIRED', 'Enter your phone number first', 400);
    }

    await verifyUserCode(
      userId,
      code,
      { ...settings, twoFactorMethod: 'phone', twoFactorSecret: null },
      'setup',
    );

    await prisma.userSettings.update({
      where: { userId },
      data: {
        twoFactorEnabled: true,
        twoFactorMethod: 'phone',
        twoFactorSecret: null,
        twoFactorPendingSecret: null,
        phoneVerifiedAt: new Date(),
      },
    });

    return { message: 'Phone verification enabled for two-factor authentication' };
  },

  async sendDisablePhoneCode(userId: string) {
    const settings = await settingsService.getOrCreate(userId);
    if (!settings.twoFactorEnabled || settings.twoFactorMethod !== 'phone' || !settings.phoneNumber) {
      return { message: 'Code sent if applicable' };
    }
    await issuePhoneCode(userId, settings.phoneNumber, 'disable');
    return { message: 'Verification code sent' };
  },

  async disable(userId: string, password: string, code: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const settings = await settingsService.getOrCreate(userId);

    if (!user?.passwordHash) {
      throw new ApiException('INVALID_CREDENTIALS', 'Password required to disable 2FA', 400);
    }
    if (!settings.twoFactorEnabled) {
      throw new ApiException('TWO_FACTOR_NOT_ENABLED', 'Two-factor authentication is not enabled', 400);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new ApiException('INVALID_CREDENTIALS', 'Incorrect password', 401);
    }

    await verifyUserCode(userId, code, settings, 'disable');

    await prisma.$transaction([
      prisma.userSettings.update({
        where: { userId },
        data: {
          twoFactorEnabled: false,
          twoFactorMethod: null,
          twoFactorSecret: null,
          twoFactorPendingSecret: null,
          phoneNumber: null,
          phoneVerifiedAt: null,
        },
      }),
      prisma.twoFactorTrustedDevice.deleteMany({ where: { userId } }),
    ]);

    return { message: 'Two-factor authentication disabled' };
  },

  async isTrustedDevice(userId: string, trustToken: string | undefined): Promise<boolean> {
    if (!trustToken?.trim()) return false;
    const record = await prisma.twoFactorTrustedDevice.findUnique({
      where: { tokenHash: hashToken(trustToken) },
    });
    if (!record || record.userId !== userId || record.expiresAt < new Date()) {
      return false;
    }
    return true;
  },

  async createTrustToken(userId: string, clientIp: string): Promise<string> {
    const rawToken = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + TRUST_DEVICE_TTL_MS);

    await prisma.twoFactorTrustedDevice.create({
      data: {
        userId,
        tokenHash: hashToken(rawToken),
        expiresAt,
        lastIp: clientIp,
      },
    });

    return rawToken;
  },

  async loginRequiresTwoFactor(userId: string, trustToken?: string): Promise<{
    required: boolean;
    method?: TwoFactorMethod;
    phoneNumberMasked?: string | null;
  }> {
    const settings = await settingsService.getOrCreate(userId);
    if (!settings.twoFactorEnabled || !settings.twoFactorMethod) {
      return { required: false };
    }

    if (await this.isTrustedDevice(userId, trustToken)) {
      return { required: false };
    }

    return {
      required: true,
      method: settings.twoFactorMethod as TwoFactorMethod,
      phoneNumberMasked: settings.phoneNumber ? maskPhone(settings.phoneNumber) : null,
    };
  },

  async beginLoginChallenge(userId: string): Promise<{
    twoFactorSession: string;
    method: TwoFactorMethod;
    phoneNumberMasked: string | null;
  }> {
    const settings = await settingsService.getOrCreate(userId);
    if (!settings.twoFactorEnabled || !settings.twoFactorMethod) {
      throw new ApiException('TWO_FACTOR_NOT_ENABLED', 'Two-factor authentication is not enabled', 400);
    }

    if (settings.twoFactorMethod === 'phone' && settings.phoneNumber) {
      await issuePhoneCode(userId, settings.phoneNumber, 'login');
    }

    return {
      twoFactorSession: signTwoFactorSession(userId),
      method: settings.twoFactorMethod as TwoFactorMethod,
      phoneNumberMasked: settings.phoneNumber ? maskPhone(settings.phoneNumber) : null,
    };
  },

  async verifyLogin(
    session: string,
    code: string,
    trustDevice: boolean,
    clientIp: string,
  ): Promise<{ user: UserDto; token: string; trustToken?: string }> {
    const userId = verifyTwoFactorSession(session);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const settings = await settingsService.getOrCreate(userId);

    if (!user || !settings.twoFactorEnabled) {
      throw new ApiException('INVALID_2FA_SESSION', 'Two-factor session expired. Sign in again.', 401);
    }

    await verifyUserCode(userId, code, settings, 'login');

    const result: { user: UserDto; token: string; trustToken?: string } = {
      user: toUserDto(user),
      token: signToken(user),
    };

    if (trustDevice) {
      result.trustToken = await this.createTrustToken(userId, clientIp);
    }

    return result;
  },
};
