import { z } from 'zod';

export const placeBetSchema = z.object({
  matchId: z.string().min(1),
  marketType: z.string().min(1),
  selectionId: z.string().min(1),
  stake: z.number().int().positive(),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).optional(),
  username: z.string().min(3).optional(),
  avatarUrl: z.string().nullable().optional(),
  country: z.string().optional(),
  signature: z.string().optional(),
  signatureLink: z.string().optional(),
  signatureMode: z.enum(['text', 'banner']).optional(),
});

export const updateSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  showProfilePublic: z.boolean().optional(),
});
