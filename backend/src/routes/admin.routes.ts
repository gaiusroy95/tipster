import { Router } from 'express';
import type { z } from 'zod';
import { asyncHandler } from '../middleware/error.middleware';
import {
  requireAuth,
  requireAdmin,
  type AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import { ApiException } from '../lib/api-exception';
import {
  adminAuditListSchema,
  adminBetsListSchema,
  adminCreateSeasonSchema,
  adminForumPostsListSchema,
  adminReorderLeaguesSchema,
  adminUpdateForumPostSchema,
  adminUpdateLeagueSchema,
  adminUpdateMarketTypeSchema,
  adminUpdateSeasonSchema,
  adminUpdateUserSchema,
  adminUpsertPrizeSchema,
  adminUsersListSchema,
  adminVoidBetSchema,
} from '../schemas/admin.schemas';
import { adminAuditService } from '../services/admin/admin-audit.service';
import {
  adminDashboardService,
  adminUsersService,
} from '../services/admin/admin-dashboard.service';
import { curatedLeagueService } from '../services/admin/curated-league.service';
import { marketTypeConfigService } from '../services/admin/market-type-config.service';
import { adminSeasonsService } from '../services/admin/admin-seasons.service';
import { adminBetsService, adminForumService } from '../services/admin/admin-moderation.service';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const data = await adminDashboardService.getStats();
    res.json({ data });
  }),
);

adminRouter.get(
  '/users',
  validateQuery(adminUsersListSchema),
  asyncHandler(async (req, res) => {
    const q = req.query as z.infer<typeof adminUsersListSchema>;
    const data = await adminUsersService.list(q);
    res.json({ data });
  }),
);

adminRouter.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const data = await adminUsersService.getById(String(req.params.id));
    if (!data) throw new ApiException('NOT_FOUND', 'User not found', 404);
    res.json({ data });
  }),
);

adminRouter.patch(
  '/users/:id',
  validateBody(adminUpdateUserSchema),
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const data = await adminUsersService.updateUser(user.id, String(req.params.id), req.body);
    if (!data) throw new ApiException('NOT_FOUND', 'User not found', 404);
    res.json({ data });
  }),
);

adminRouter.post(
  '/users/:id/verify-email',
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const data = await adminUsersService.forceVerifyEmail(user.id, String(req.params.id));
    res.json({ data });
  }),
);

adminRouter.get(
  '/leagues',
  asyncHandler(async (req, res) => {
    const sportId = typeof req.query.sportId === 'string' ? req.query.sportId : undefined;
    const data = await curatedLeagueService.listForAdmin(sportId);
    res.json({ data });
  }),
);

adminRouter.post(
  '/leagues/sync',
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const data = await curatedLeagueService.syncFromOvertime(user.id);
    res.json({ data });
  }),
);

adminRouter.patch(
  '/leagues/:id',
  validateBody(adminUpdateLeagueSchema),
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const data = await curatedLeagueService.update(user.id, String(req.params.id), req.body);
    res.json({ data });
  }),
);

adminRouter.post(
  '/leagues/reorder',
  validateBody(adminReorderLeaguesSchema),
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const data = await curatedLeagueService.reorder(user.id, req.body.orderedIds);
    res.json({ data });
  }),
);

adminRouter.get(
  '/market-types',
  asyncHandler(async (_req, res) => {
    const data = await marketTypeConfigService.listForAdmin();
    res.json({ data });
  }),
);

adminRouter.get(
  '/market-types/overtime-catalog',
  asyncHandler(async (_req, res) => {
    const data = await marketTypeConfigService.listOvertimeCatalog();
    res.json({ data });
  }),
);

adminRouter.post(
  '/market-types/sync',
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const [arena, catalog] = await Promise.all([
      marketTypeConfigService.ensureDefaults(user.id),
      marketTypeConfigService.listOvertimeCatalog(),
    ]);
    res.json({ data: { arena, catalogCount: catalog.length } });
  }),
);

adminRouter.patch(
  '/market-types/:id',
  validateBody(adminUpdateMarketTypeSchema),
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const data = await marketTypeConfigService.update(user.id, String(req.params.id), req.body);
    res.json({ data });
  }),
);

adminRouter.get(
  '/seasons',
  asyncHandler(async (_req, res) => {
    const data = await adminSeasonsService.list();
    res.json({ data });
  }),
);

adminRouter.post(
  '/seasons',
  validateBody(adminCreateSeasonSchema),
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const data = await adminSeasonsService.create(user.id, req.body);
    res.json({ data });
  }),
);

adminRouter.patch(
  '/seasons/:id',
  validateBody(adminUpdateSeasonSchema),
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const data = await adminSeasonsService.update(user.id, String(req.params.id), req.body);
    res.json({ data });
  }),
);

adminRouter.post(
  '/seasons/:id/activate',
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const data = await adminSeasonsService.activate(user.id, String(req.params.id));
    if (!data) throw new ApiException('NOT_FOUND', 'Season not found', 404);
    res.json({ data });
  }),
);

adminRouter.post(
  '/seasons/:id/prizes',
  validateBody(adminUpsertPrizeSchema),
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const data = await adminSeasonsService.upsertPrize(user.id, String(req.params.id), req.body);
    res.json({ data });
  }),
);

adminRouter.delete(
  '/seasons/prizes/:prizeId',
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    await adminSeasonsService.deletePrize(user.id, String(req.params.prizeId));
    res.status(204).send();
  }),
);

adminRouter.get(
  '/bets',
  validateQuery(adminBetsListSchema),
  asyncHandler(async (req, res) => {
    const data = await adminBetsService.list(req.query as z.infer<typeof adminBetsListSchema>);
    res.json({ data });
  }),
);

adminRouter.post(
  '/bets/:id/void',
  validateBody(adminVoidBetSchema),
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const data = await adminBetsService.voidBet(user.id, String(req.params.id), req.body.reason);
    res.json({ data });
  }),
);

adminRouter.get(
  '/posts',
  validateQuery(adminForumPostsListSchema),
  asyncHandler(async (req, res) => {
    const data = await adminForumService.listPosts(
      req.query as z.infer<typeof adminForumPostsListSchema>,
    );
    res.json({ data });
  }),
);

adminRouter.patch(
  '/posts/:id',
  validateBody(adminUpdateForumPostSchema),
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const data = await adminForumService.updatePost(user.id, String(req.params.id), req.body);
    res.json({ data });
  }),
);

adminRouter.delete(
  '/posts/:id',
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    await adminForumService.deletePost(user.id, String(req.params.id));
    res.status(204).send();
  }),
);

adminRouter.delete(
  '/comments/:id',
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    await adminForumService.deleteComment(user.id, String(req.params.id));
    res.status(204).send();
  }),
);

adminRouter.get(
  '/audit-logs',
  validateQuery(adminAuditListSchema),
  asyncHandler(async (req, res) => {
    const data = await adminAuditService.list(req.query as z.infer<typeof adminAuditListSchema>);
    res.json({ data });
  }),
);
