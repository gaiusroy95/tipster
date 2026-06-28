import { z } from 'zod';

export const adminListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
});

export const adminUsersListSchema = adminListQuerySchema.extend({
  banned: z
    .preprocess(
      (val) => (val === 'true' ? true : val === 'false' ? false : undefined),
      z.boolean().optional(),
    ),
  role: z.enum(['USER', 'ADMIN']).optional(),
  sortBy: z.enum(['createdAt', 'displayName', 'balance', 'rank']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const adminUpdateUserSchema = z.object({
  role: z.enum(['USER', 'ADMIN']).optional(),
  isBanned: z.boolean().optional(),
  banReason: z.string().max(500).nullable().optional(),
  displayName: z.string().min(1).max(100).optional(),
  balanceAdjustment: z.number().int().optional(),
  balanceReason: z.string().max(500).optional(),
});

export const adminUpdateLeagueSchema = z.object({
  isEnabled: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  name: z.string().min(1).max(200).optional(),
  country: z.string().max(100).optional(),
});

export const adminUpdateMarketTypeSchema = z.object({
  isEnabled: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  label: z.string().min(1).max(100).optional(),
});

export const adminReorderLeaguesSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});

export const adminCreateSeasonSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.enum(['upcoming', 'active', 'completed']).optional(),
  prizes: z
    .array(
      z.object({
        rankFrom: z.number().int().positive(),
        rankTo: z.number().int().positive(),
        name: z.string().min(1).max(200),
        description: z.string().min(1).max(1000),
        imageUrl: z.string().url().optional(),
      }),
    )
    .optional(),
});

export const adminUpdateSeasonSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['upcoming', 'active', 'completed']).optional(),
});

export const adminUpsertPrizeSchema = z.object({
  id: z.string().optional(),
  rankFrom: z.number().int().positive(),
  rankTo: z.number().int().positive(),
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  imageUrl: z.string().url().optional(),
});

export const adminBetsListSchema = adminListQuerySchema.extend({
  status: z.string().optional(),
  userId: z.string().optional(),
  matchId: z.string().optional(),
});

export const adminVoidBetSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const adminForumPostsListSchema = adminListQuerySchema.extend({
  status: z.string().optional(),
});

export const adminUpdateForumPostSchema = z.object({
  status: z.enum(['published', 'hidden', 'draft']).optional(),
});

export const adminAuditListSchema = adminListQuerySchema.extend({
  entityType: z.string().optional(),
});
