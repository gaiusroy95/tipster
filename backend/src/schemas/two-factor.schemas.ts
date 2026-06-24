import { z } from 'zod';

export const twoFactorCodeSchema = z.object({
  code: z.string().min(6).max(8),
});

export const twoFactorPhoneSchema = z.object({
  phoneNumber: z.string().trim().min(8).max(20),
});

export const twoFactorDisableSchema = z.object({
  password: z.string().min(1),
  code: z.string().min(6).max(8),
});

export const twoFactorLoginVerifySchema = z.object({
  session: z.string().min(1),
  code: z.string().min(6).max(8),
  trustDevice: z.boolean().optional().default(true),
});

export const loginWithTrustSchema = z.object({
  email: z.string().trim().email().transform((v) => v.toLowerCase()),
  password: z.string().min(1),
  trustToken: z.string().optional(),
});
