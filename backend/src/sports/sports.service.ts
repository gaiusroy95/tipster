import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import axios, { AxiosResponse } from 'axios';
import {
  fetchLiveMarketsWithRetry,
  fetchMarketTypesWithRetry,
  fetchSportsWithRetry,
} from 'src/api/overtime';
import { Market, MarketType, Sport } from 'src/types/overtime';
import { Network } from 'src/types/web3';
import { getMinMaturity } from 'src/utils/overtime.util';

@Injectable()
export class SportsService {
  private readonly logger = new Logger(SportsService.name);

  private readonly REMOTE_API_BASE = 'https://api.overtime.io/overtime-v2';
  private readonly OVERTIME_NETWORK_ID = 10;
  private cachedData: unknown = null;
  private cachedHash: string | null = null;

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async fetchSportsMapper() {
    const cacheKey = 'overtime-v2-sports';
    const cached = await this.cacheManager.get<{ [id: string]: Sport }>(cacheKey);
    if (cached) return cached;

    const sports = await fetchSportsWithRetry();
    await this.cacheManager.set(cacheKey, sports, 86400 * 1000);
    return sports;
  }

  async fetchMarketTypesMapper() {
    const cacheKey = 'overtime-v2-marketTypes';
    const cached = await this.cacheManager.get<{ [id: string]: MarketType }>(cacheKey);
    if (cached) return cached;

    const marketTypes = await fetchMarketTypesWithRetry();
    await this.cacheManager.set(cacheKey, marketTypes, 86400 * 1000);
    return marketTypes;
  }

  async fetchMarketsMapper(network: number, query: Record<string, unknown>) {
    try {
      const params = {
        ungroup: true,
        onlyBasicProperties: true,
        includeHashInResponse: true,
        status: 'open',
        onlyMainMarkets: true,
        includeProofs: false,
        minMaturity: getMinMaturity(),
        ...(this.cachedHash ? { responseHash: this.cachedHash } : {}),
        ...query,
      };

      const url = `${this.REMOTE_API_BASE}/networks/${this.OVERTIME_NETWORK_ID}/markets`;
      const response = await axios.get(url, {
        params,
        headers: { 'x-api-key': process.env.X_API_KEY },
        timeout: 15000,
      });

      if (response.data === 'no change') {
        this.logger.log('No change in sports data, using cached version.');
        return this.cachedData ?? { message: 'No cached data available' };
      }

      if (response.data?.markets === 'no change') {
        this.logger.log('Overtime returned markets: "no change", serving cached data.');
        if (response.data.responseHash) this.cachedHash = response.data.responseHash;
        if (this.cachedData) return this.cachedData;

        this.logger.warn('No cached markets on "no change"; refetching without hash.');
        const fresh = await axios.get(url, {
          params: { ...params, responseHash: undefined, includeHashInResponse: false },
          headers: { 'x-api-key': process.env.X_API_KEY },
          timeout: 15000,
        });
        this.cachedData = fresh.data;
        return this.cachedData;
      }

      if (response.data.responseHash) {
        this.cachedHash = response.data.responseHash;
      }

      this.cachedData = response.data;
      return this.cachedData;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch sports data: ${message}`);

      if (this.cachedData) {
        this.logger.warn('Returning cached data due to fetch error');
        return this.cachedData;
      }

      throw new Error('Failed to fetch sports data');
    }
  }

  async fetchLeaguesMapper(): Promise<Record<string, { id: number; name: string; count: number }[]>> {
    const cacheKey = 'overtime-v2-leagues-v3';
    const cached = await this.cacheManager.get<
      Record<string, { id: number; name: string; count: number }[]>
    >(cacheKey);
    if (cached) return cached;

    const [allSportsRaw, rawMarkets] = await Promise.all([
      this.fetchSportsMapper(),
      this.fetchMarketsMapper(10, {
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

    await this.cacheManager.set(cacheKey, result, 10 * 60 * 1000);
    return result;
  }

  async fetchLiveMarketsMapper(network: number = 10) {
    try {
      const cacheKey = 'overtime-v2-live-markets';
      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData) return cachedData;

      const liveMarketsData = await fetchLiveMarketsWithRetry(
        this.OVERTIME_NETWORK_ID,
        3,
        1000,
      );

      await this.cacheManager.set(cacheKey, liveMarketsData, 30 * 1000);
      return liveMarketsData;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch live markets: ${message}`);

      const cachedData = await this.cacheManager.get('overtime-v2-live-markets');
      if (cachedData) {
        this.logger.warn('Returning stale cached live markets data due to fetch error');
        return cachedData;
      }

      return {
        markets: [],
        errors: [message || 'Failed to fetch live markets'],
      };
    }
  }

  async getMarket(networkId: Network = 10, gameId: string): Promise<Market> {
    const market = await this.getMarketOrNull(networkId, gameId);
    if (!market) {
      throw new HttpException(
        'Market not found or no longer available',
        HttpStatus.NOT_FOUND,
      );
    }
    return market;
  }

  async getMarketOrNull(networkId: Network = 10, gameId: string): Promise<Market | null> {
    try {
      if (!gameId) return null;

      const encodedGameId = encodeURIComponent(gameId);
      const url = `${this.REMOTE_API_BASE}/networks/${this.OVERTIME_NETWORK_ID}/markets/${encodedGameId}`;

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
      this.logger.warn(`getMarketOrNull ${gameId}: ${message}`);
      return null;
    }
  }
}
