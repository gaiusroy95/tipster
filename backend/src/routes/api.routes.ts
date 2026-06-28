import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import {
  requireAuth,
  getViewerIdFromRequest,
  type AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { ApiException } from '../lib/api-exception';
import { toUserDto } from '../auth/user.mapper';
import {
  changeEmailSchema,
  changePasswordSchema,
  placeBetSchema,
  updateProfileSchema,
  updateSettingsSchema,
} from '../schemas/api.schemas';
import { dashboardService } from '../services/dashboard.service';
import { walletService } from '../services/wallet.service';
import { betService } from '../services/bet.service';
import { leaderboardService } from '../services/leaderboard.service';
import { profileService } from '../services/profile.service';
import { seasonService } from '../services/season.service';
import { notificationService } from '../services/notification.service';
import { settingsService } from '../services/settings.service';
import { twoFactorService } from '../services/two-factor.service';
import { achievementService } from '../services/achievement.service';
import { newsService } from '../services/news.service';
import { curatedLeagueService } from '../services/admin/curated-league.service';
import { marketTypeConfigService } from '../services/admin/market-type-config.service';

export const apiRouter = Router();

apiRouter.get(
  '/news',
  asyncHandler(async (req, res) => {
    const sport = typeof req.query.sport === 'string' ? req.query.sport : 'soccer';
    const limit = Number(req.query.limit ?? 10);
    const offset = Number(req.query.offset ?? 0);
    const data = await newsService.getSportsNews({ sport, limit, offset });
    res.json({ data });
  }),
);

apiRouter.get(
  '/dashboard',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const data = await dashboardService.getDashboard(user.id);
    res.json({ data });
  }),
);

apiRouter.get(
  '/wallet',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const data = await walletService.getWallet(user.id);
    res.json({ data });
  }),
);

apiRouter.get(
  '/bets',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const status = req.query.status as string | undefined;
    const data = await betService.listBets(user.id, status);
    res.json({ data });
  }),
);

apiRouter.get(
  '/bets/daily-limit',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const data = await betService.getDailyBetUsage(user.id);
    res.json({ data });
  }),
);

apiRouter.post(
  '/bets',
  requireAuth,
  validateBody(placeBetSchema),
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const data = await betService.placeBet(user.id, req.body);
    res.status(201).json({ data });
  }),
);

apiRouter.post(
  '/bets/:betId/cancel',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const data = await betService.cancelBet(user.id, String(req.params.betId));
    res.json({ data });
  }),
);

apiRouter.get(
  '/leaderboard',
  asyncHandler(async (req, res) => {
    const search = req.query.search as string | undefined;
    const sort = req.query.sort as string | undefined;
    const data = await leaderboardService.getLeaderboard({ search, sort });
    res.json({ data });
  }),
);

apiRouter.get(
  '/players/:userId',
  asyncHandler(async (req, res) => {
    const userId = String(req.params.userId);
    const viewerId = getViewerIdFromRequest(req);

    const settings = await settingsService.getOrCreate(userId);
    if (!settings.showProfilePublic && viewerId !== userId) {
      throw new ApiException('NOT_FOUND', 'Player not found', 404);
    }

    const data = await profileService.getProfileStats(userId);
    if (!data) {
      throw new ApiException('NOT_FOUND', 'Player not found', 404);
    }
    res.json({ data });
  }),
);

apiRouter.get(
  '/players/:userId/bets',
  asyncHandler(async (req, res) => {
    const userId = String(req.params.userId);
    const status = req.query.status as string | undefined;
    const data = await betService.listPublicBets(userId, status);
    res.json({ data });
  }),
);

apiRouter.get(
  '/seasons',
  asyncHandler(async (_req, res) => {
    const data = await seasonService.listSeasons();
    res.json({ data });
  }),
);

apiRouter.get(
  '/seasons/active',
  asyncHandler(async (_req, res) => {
    const data = await seasonService.getActiveSeasonDto();
    res.json({ data });
  }),
);

apiRouter.get(
  '/seasons/:seasonId',
  asyncHandler(async (req, res) => {
    const data = await seasonService.getSeasonById(String(req.params.seasonId));
    if (!data) {
      throw new ApiException('NOT_FOUND', 'Season not found', 404);
    }
    res.json({ data });
  }),
);

apiRouter.get(
  '/notifications',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const data = await notificationService.listForUser(user.id);
    res.json({ data });
  }),
);

apiRouter.patch(
  '/notifications/:id/read',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const data = await notificationService.markRead(
      user.id,
      String(req.params.id),
    );
    if (!data) {
      throw new ApiException('NOT_FOUND', 'Notification not found', 404);
    }
    res.json({ data });
  }),
);

apiRouter.patch(
  '/profile',
  requireAuth,
  validateBody(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const updated = await profileService.updateProfile(user.id, req.body);
    res.json({ data: toUserDto(updated) });
  }),
);

apiRouter.post(
  '/profile/change-password',
  requireAuth,
  validateBody(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const data = await profileService.changePassword(user.id, req.body);
    res.json({ data });
  }),
);

apiRouter.post(
  '/profile/change-email',
  requireAuth,
  validateBody(changeEmailSchema),
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const updated = await profileService.changeEmail(user.id, req.body);
    res.json({ data: toUserDto(updated) });
  }),
);

apiRouter.get(
  '/settings',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const settings = await settingsService.getOrCreate(user.id);
    const twoFactor = await twoFactorService.getStatus(user.id);
    res.json({
      data: {
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        showProfilePublic: settings.showProfilePublic,
        ...twoFactor,
      },
    });
  }),
);

apiRouter.patch(
  '/settings',
  requireAuth,
  validateBody(updateSettingsSchema),
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const settings = await settingsService.update(user.id, req.body);
    await achievementService.syncUserAchievements(user.id);
    res.json({
      data: {
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        showProfilePublic: settings.showProfilePublic,
      },
    });
  }),
);

apiRouter.get(
  '/achievements',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const data = await achievementService.getProgress(user.id);
    res.json({ data });
  }),
);

apiRouter.get(
  '/market-types/enabled',
  asyncHandler(async (_req, res) => {
    const marketTypes = await marketTypeConfigService.listEnabledKeys();
    res.set('Cache-Control', 'private, max-age=30');
    res.json({ data: { marketTypes } });
  }),
);

apiRouter.get(
  '/leagues/curated/revision',
  asyncHandler(async (_req, res) => {
    const [leagueRevision, marketRevision] = await Promise.all([
      curatedLeagueService.getCurationRevision(),
      marketTypeConfigService.getRevision(),
    ]);
    const revision = `${leagueRevision}|${marketRevision}`;
    res.set('Cache-Control', 'no-store');
    res.json({ data: { revision } });
  }),
);

apiRouter.get(
  '/leagues/curated',
  asyncHandler(async (req, res) => {
    const sportId = typeof req.query.sportId === 'string' ? req.query.sportId : undefined;
    const light = req.query.light === 'true' || req.query.light === '1';
    const data = await curatedLeagueService.listCuratedPublic(sportId, { light });
    res.set('Cache-Control', light ? 'private, max-age=60' : 'no-store');
    res.json({ data });
  }),
);
