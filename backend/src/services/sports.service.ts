import axios, { AxiosResponse } from 'axios';
import {
  fetchLiveMarketsWithRetry,
  fetchMarketTypesWithRetry,
  fetchSportsWithRetry,
} from '../api/overtime';
import { LiveMarkets, LiveMarket, Market, MarketType, Sport } from '../types/overtime';
import { Network } from '../types/web3';
import { getMinMaturity } from '../utils/overtime.util';
import { ApiException } from '../lib/api-exception';
import { MemoryCache } from '../lib/memory-cache';

const cache = new MemoryCache();

const FINISHED_CACHE_MAX = 500;

type MarketsCacheEntry = {
  data: unknown;
  hash: string | null;
};

function extractMarketsFromPayload(data: unknown): Market[] {
  if (Array.isArray(data)) return data as Market[];
  if (data && typeof data === 'object' && 'markets' in data) {
    const markets = (data as { markets: unknown }).markets;
    if (Array.isArray(markets)) return markets as Market[];
  }
  return [];
}

function isInvalidOvertimeMarketsPayload(data: unknown): boolean {
  return typeof data === 'string' || data === 'no change';
}

function marketsCacheKey(query: Record<string, unknown>): string {
  const status = typeof query.status === 'string' ? query.status : 'open';
  return `markets-${status}`;
}

export const sportsService = {
  REMOTE_API_BASE: 'https://api.overtime.io/overtime-v2',
  OVERTIME_NETWORK_ID: 10,
  marketsCacheByKey: new Map<string, MarketsCacheEntry>(),
  activeLiveGameIds: new Set<string>(),
  finishedMarketsCache: new Map<string, Market>(),

  async fetchSportsMapper() {
    const cacheKey = 'overtime-v2-sports';
    const cached = cache.get<{ [id: string]: Sport }>(cacheKey);
    if (cached) return cached;

    const sports = await fetchSportsWithRetry();
    cache.set(cacheKey, sports, 86400 * 1000);
    return sports;
  },

  async fetchMarketTypesMapper() {
    const cacheKey = 'overtime-v2-marketTypes';
    const cached = cache.get<{ [id: string]: MarketType }>(cacheKey);
    if (cached) return cached;

    const marketTypes = await fetchMarketTypesWithRetry();
    cache.set(cacheKey, marketTypes, 86400 * 1000);
    return marketTypes;
  },

  trackLiveGameTransitions(currentGameIds: string[]) {
    const current = new Set(currentGameIds);
    const removed = [...sportsService.activeLiveGameIds].filter((id) => !current.has(id));
    sportsService.activeLiveGameIds = current;

    if (removed.length > 0) {
      void sportsService.archiveFinishedGames(removed);
    }
  },

  async archiveFinishedGames(gameIds: string[]) {
    for (const gameId of gameIds) {
      try {
        const market = await sportsService.getMarketOrNull(
          sportsService.OVERTIME_NETWORK_ID,
          gameId,
        );
        if (
          market &&
          (market.isResolved || market.statusCode === 'resolved' || market.status === 10)
        ) {
          sportsService.finishedMarketsCache.set(gameId, market);
        }
      } catch {
        // Best-effort archival when a live game disappears from feeds.
      }
    }

    while (sportsService.finishedMarketsCache.size > FINISHED_CACHE_MAX) {
      const oldestKey = sportsService.finishedMarketsCache.keys().next().value;
      if (!oldestKey) break;
      sportsService.finishedMarketsCache.delete(oldestKey);
    }
  },

  async fetchMarketsMapper(network: number, query: Record<string, unknown>) {
    const status = typeof query.status === 'string' ? query.status : 'open';
    const cacheKey = marketsCacheKey(query);
    const cachedEntry = sportsService.marketsCacheByKey.get(cacheKey);

    try {
      const params: Record<string, unknown> = {
        ungroup: true,
        onlyBasicProperties: true,
        includeHashInResponse: true,
        status: 'open',
        onlyMainMarkets: true,
        includeProofs: false,
        ...(status === 'open' ? { minMaturity: getMinMaturity() } : {}),
        ...(cachedEntry?.hash ? { responseHash: cachedEntry.hash } : {}),
        ...query,
      };

      const url = `${sportsService.REMOTE_API_BASE}/networks/${sportsService.OVERTIME_NETWORK_ID}/markets`;
      const response = await axios.get(url, {
        params,
        headers: { 'x-api-key': process.env.X_API_KEY },
        timeout: 15000,
      });

      if (response.data === 'no change') {
        console.log(`[SportsService] No change for ${status} markets, using cached version.`);
        return cachedEntry?.data ?? { markets: [] };
      }

      if (response.data?.markets === 'no change') {
        console.log(`[SportsService] Overtime returned ${status} markets: "no change".`);
        if (response.data.responseHash) {
          sportsService.marketsCacheByKey.set(cacheKey, {
            data: cachedEntry?.data ?? { markets: [] },
            hash: response.data.responseHash,
          });
        }
        if (cachedEntry?.data) return cachedEntry.data;

        console.warn('[SportsService] No cached markets on "no change"; refetching without hash.');
        const fresh = await axios.get(url, {
          params: { ...params, responseHash: undefined, includeHashInResponse: false },
          headers: { 'x-api-key': process.env.X_API_KEY },
          timeout: 15000,
        });
        if (!isInvalidOvertimeMarketsPayload(fresh.data)) {
          sportsService.marketsCacheByKey.set(cacheKey, {
            data: fresh.data,
            hash:
              fresh.data && typeof fresh.data === 'object' && 'responseHash' in fresh.data
                ? String((fresh.data as { responseHash?: string }).responseHash ?? '')
                : null,
          });
        }
        return fresh.data;
      }

      if (isInvalidOvertimeMarketsPayload(response.data)) {
        console.warn(
          `[SportsService] Overtime rejected ${status} markets request:`,
          String(response.data).slice(0, 120),
        );
        return cachedEntry?.data ?? { markets: [] };
      }

      const responseHash =
        response.data &&
        typeof response.data === 'object' &&
        'responseHash' in response.data
          ? String((response.data as { responseHash?: string }).responseHash ?? '')
          : null;

      sportsService.marketsCacheByKey.set(cacheKey, {
        data: response.data,
        hash: responseHash,
      });

      if (status === 'ongoing') {
        sportsService.trackLiveGameTransitions(
          extractMarketsFromPayload(response.data).map((m) => m.gameId),
        );
      }

      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[SportsService] Failed to fetch ${status} markets: ${message}`);

      if (cachedEntry?.data) {
        console.warn('[SportsService] Returning cached data due to fetch error');
        return cachedEntry.data;
      }

      throw new Error('Failed to fetch sports data');
    }
  },

  async fetchLeaguesMapper(): Promise<Record<string, { id: number; name: string; count: number }[]>> {
    const cacheKey = 'overtime-v2-leagues-v3';
    const cached = cache.get<
      Record<string, { id: number; name: string; count: number }[]>
    >(cacheKey);
    if (cached) return cached;

    const [allSportsRaw, rawMarkets] = await Promise.all([
      sportsService.fetchSportsMapper(),
      sportsService.fetchMarketsMapper(10, {
        ungroup: true,
        onlyBasicProperties: true,
        includeHashInResponse: true,
        status: 'open',
        onlyMainMarkets: true,
        includeProofs: false,
      }),
    ]);

    const allSports: Record<number, { sport: string; label: string }> =
      (allSportsRaw as Record<number, { sport: string; label: string }>) ?? {};

    const marketsArray: unknown[] = Array.isArray(rawMarkets)
      ? rawMarkets
      : Array.isArray((rawMarkets as { markets?: unknown[] })?.markets)
        ? (rawMarkets as { markets: unknown[] }).markets
        : [];

    const leaguesMap: Record<string, Map<number, { name: string; count: number }>> = {};

    for (const market of marketsArray) {
      const m = market as {
        subLeagueId?: number;
        sport?: string;
        leagueId?: number;
        leagueName?: string;
      };

      const subLeagueId = m?.subLeagueId;
      const sportCategory =
        m?.sport || (subLeagueId != null ? allSports[subLeagueId]?.sport : '') || '';
      const leagueId = m?.leagueId;
      const leagueName =
        m?.leagueName ||
        (subLeagueId != null ? allSports[subLeagueId]?.label : '') ||
        '';

      if (!sportCategory || sportCategory === 'Futures' || leagueId == null || !leagueName) {
        continue;
      }

      if (!leaguesMap[sportCategory]) leaguesMap[sportCategory] = new Map();
      const existing = leaguesMap[sportCategory].get(leagueId);
      if (existing) {
        existing.count++;
      } else {
        leaguesMap[sportCategory].set(leagueId, { name: leagueName, count: 1 });
      }
    }

    const result: Record<string, { id: number; name: string; count: number }[]> = {};
    for (const [sport, map] of Object.entries(leaguesMap)) {
      result[sport] = Array.from(map.entries())
        .map(([id, { name, count }]) => ({ id, name, count }))
        .sort((a, b) => b.count - a.count);
    }

    cache.set(cacheKey, result, 10 * 60 * 1000);
    return result;
  },

  async fetchLiveMarketsMapper(network: number = 10) {
    try {
      const cacheKey = 'overtime-v2-live-markets-merged';
      const cachedData = cache.get(cacheKey);
      if (cachedData) return cachedData;

      const liveMarketsData = (await fetchLiveMarketsWithRetry(
        sportsService.OVERTIME_NETWORK_ID,
        3,
        1000,
      )) as LiveMarkets;

      const liveMarkets = liveMarketsData.markets ?? [];
      const ongoingRaw = await sportsService.fetchMarketsMapper(network, {
        status: 'ongoing',
        ungroup: true,
        onlyBasicProperties: true,
        onlyMainMarkets: true,
        includeHashInResponse: false,
      });
      const ongoingMarkets = extractMarketsFromPayload(ongoingRaw);

      const liveByGameId = new Map(liveMarkets.map((market) => [market.gameId, market]));
      const mergedByGameId = new Map<string, LiveMarket>();

      for (const ongoing of ongoingMarkets) {
        const live = liveByGameId.get(ongoing.gameId);
        mergedByGameId.set(
          ongoing.gameId,
          live
            ? { ...ongoing, ...live }
            : {
                ...ongoing,
                homeScore: 0,
                awayScore: 0,
                gameClock: 0,
                gamePeriod: '',
                homeScoreByPeriod: [],
                awayScoreByPeriod: [],
              },
        );
      }

      for (const live of liveMarkets) {
        if (!mergedByGameId.has(live.gameId)) {
          mergedByGameId.set(live.gameId, live);
        }
      }

      const merged: LiveMarkets = {
        markets: Array.from(mergedByGameId.values()),
        errors: liveMarketsData.errors ?? [],
      };

      sportsService.trackLiveGameTransitions(merged.markets.map((market) => market.gameId));

      cache.set(cacheKey, merged, 30 * 1000);
      return merged;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[SportsService] Failed to fetch live markets: ${message}`);

      const cachedData = cache.get('overtime-v2-live-markets-merged');
      if (cachedData) {
        console.warn('[SportsService] Returning stale cached live markets data due to fetch error');
        return cachedData;
      }

      return {
        markets: [],
        errors: [message || 'Failed to fetch live markets'],
      };
    }
  },

  async fetchFinishedMarketsMapper(network: number = 10) {
    const cacheKey = 'overtime-v2-finished-markets';
    const cached = cache.get<{ markets: Market[] }>(cacheKey);
    if (cached) return cached;

    const resolvedRaw = await sportsService.fetchMarketsMapper(network, {
      status: 'resolved',
      ungroup: true,
      onlyBasicProperties: true,
      onlyMainMarkets: true,
      includeHashInResponse: false,
    });
    const resolvedMarkets = extractMarketsFromPayload(resolvedRaw);

    const mergedByGameId = new Map<string, Market>();
    for (const market of resolvedMarkets) {
      if (market.gameId) mergedByGameId.set(market.gameId, market);
    }
    for (const [gameId, market] of sportsService.finishedMarketsCache) {
      mergedByGameId.set(gameId, market);
    }

    const markets = Array.from(mergedByGameId.values()).sort((a, b) => b.maturity - a.maturity);
    const result = { markets };
    cache.set(cacheKey, result, 60 * 1000);
    return result;
  },

  async getMarket(networkId: Network = 10, gameId: string): Promise<Market> {
    const market = await sportsService.getMarketOrNull(networkId, gameId);
    if (!market) {
      throw new ApiException(
        'NOT_FOUND',
        'Market not found or no longer available',
        404,
      );
    }
    return market;
  },

  async getMarketOrNull(networkId: Network = 10, gameId: string): Promise<Market | null> {
    try {
      if (!gameId) return null;

      const encodedGameId = encodeURIComponent(gameId);
      const url = `${sportsService.REMOTE_API_BASE}/networks/${sportsService.OVERTIME_NETWORK_ID}/markets/${encodedGameId}`;

      const response: AxiosResponse<Market> = await axios.get(url, {
        headers: {
          Accept: 'application/json',
          'x-api-key': process.env.X_API_KEY,
        },
        timeout: 8000,
        validateStatus: (status) => status === 200 || status === 404,
      });

      if (response.status === 404) return null;

      const market = response.data;
      if (!market?.gameId) return null;

      return market;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[SportsService] getMarketOrNull ${gameId}: ${message}`);
      return null;
    }
  },
};
