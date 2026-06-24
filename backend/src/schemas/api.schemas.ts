import { z } from 'zod';
import { emailField, loginPasswordField, passwordField, usernameField } from '../auth/auth.validation';

export const placeBetSchema = z.object({
  matchId: z.string().min(1),
  marketType: z.string().min(1),
  selectionId: z.string().min(1),
  stake: z.number().int().positive(),
});

const MAX_AVATAR_URL_LENGTH = 3_000_000;

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).optional(),
  username: usernameField.optional(),
  avatarUrl: z
    .string()
    .max(MAX_AVATAR_URL_LENGTH, 'Avatar image is too large')
    .nullable()
    .optional(),
  country: z.string().max(8).optional(),
  signature: z.string().max(500).optional(),
  signatureLink: z.string().max(500).optional(),
  signatureMode: z.enum(['text', 'banner']).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: loginPasswordField,
  newPassword: passwordField,
});

export const changeEmailSchema = z.object({
  email: emailField,
  password: loginPasswordField,
});

export const updateSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  showProfilePublic: z.boolean().optional(),
});
