import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { sportsService } from '../services/sports.service';
import { arenaBootstrapService } from '../services/arena-bootstrap.service';

export const sportsRouter = Router();

sportsRouter.get(
  '/bootstrap',
  asyncHandler(async (req, res) => {
    const sportId = typeof req.query.sportId === 'string' ? req.query.sportId : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : 'scheduled';
    const data = await arenaBootstrapService.fetchBootstrap(sportId, status);
    res.set('Cache-Control', 'private, max-age=15');
    res.json(data);
  }),
);

sportsRouter.get(
  '/sports',
  asyncHandler(async (_req, res) => {
    const data = await sportsService.fetchSportsMapper();
    res.json(data);
  }),
);

sportsRouter.get(
  '/market-types',
  asyncHandler(async (_req, res) => {
    const data = await sportsService.fetchMarketTypesMapper();
    res.json(data);
  }),
);

sportsRouter.get(
  '/leagues',
  asyncHandler(async (_req, res) => {
    const data = await sportsService.fetchLeaguesMapper();
    res.json(data);
  }),
);

sportsRouter.get(
  '/networks/:network/markets',
  asyncHandler(async (req, res) => {
    const data = await sportsService.fetchMarketsMapper(10, req.query as Record<string, unknown>);
    res.json(data);
  }),
);

sportsRouter.get(
  '/networks/:network/markets/:gameId',
  asyncHandler(async (req, res) => {
    const data = await sportsService.getMarket(10, String(req.params.gameId));
    res.json(data);
  }),
);

sportsRouter.get(
  '/networks/:network/live-markets',
  asyncHandler(async (_req, res) => {
    const data = await sportsService.fetchLiveMarketsMapper(10);
    res.json(data);
  }),
);

sportsRouter.get(
  '/networks/:network/finished-markets',
  asyncHandler(async (_req, res) => {
    const data = await sportsService.fetchFinishedMarketsMapper(10);
    res.json(data);
  }),
);
