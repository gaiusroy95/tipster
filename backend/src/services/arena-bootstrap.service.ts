import { MemoryCache } from '../lib/memory-cache';
import { normalizeSportId } from '../lib/map-overtime-sport';
import { curatedLeagueService } from './admin/curated-league.service';
import { marketTypeConfigService } from './admin/market-type-config.service';
import { sportsService } from './sports.service';
import type { LiveMarkets, Market } from '../types/overtime';

const cache = new MemoryCache();
const BOOTSTRAP_TTL_MS = 30 * 1000;

function extractMarketsFromPayload(data: unknown): Market[] {
  if (Array.isArray(data)) return data as Market[];
  if (data && typeof data === 'object' && 'markets' in data) {
    const markets = (data as { markets: unknown }).markets;
    if (Array.isArray(markets)) return markets as Market[];
  }
  return [];
}

async function fetchMarketsForStatus(status: string): Promise<Market[]> {
  if (status === 'live') {
    const live = (await sportsService.fetchLiveMarketsMapper(10)) as LiveMarkets;
    return live.markets ?? [];
  }

  if (status === 'finished') {
    const finished = await sportsService.fetchFinishedMarketsMapper(10);
    return finished.markets ?? [];
  }

  const openRaw = await sportsService.fetchMarketsMapper(10, {
    ungroup: true,
    onlyBasicProperties: true,
    includeHashInResponse: true,
    status: 'open',
    onlyMainMarkets: true,
    includeProofs: false,
  });

  return extractMarketsFromPayload(openRaw);
}

export const arenaBootstrapService = {
  async fetchBootstrap(sportId?: string, status = 'scheduled') {
    const normalizedSportId = sportId ? normalizeSportId(sportId) : undefined;
    const cacheKey = `arena-bootstrap-${normalizedSportId ?? 'all'}-${status}`;
    const cached = cache.get<{
      marketTypes: Awaited<ReturnType<typeof sportsService.fetchMarketTypesMapper>>;
      sports: Awaited<ReturnType<typeof sportsService.fetchSportsMapper>>;
      leagues: Awaited<ReturnType<typeof sportsService.fetchLeaguesMapper>>;
      markets: Market[];
      enabledMarketTypes: string[];
      curation: {
        active: boolean;
        rows: Awaited<ReturnType<typeof curatedLeagueService.listCuratedPublic>>;
        allowedLeagueIds: string[] | null;
      };
    }>(cacheKey);

    if (cached) return cached;

    const [marketTypes, sports, leagues, curatedRows, markets, enabledMarketTypes] = await Promise.all([
      sportsService.fetchMarketTypesMapper(),
      sportsService.fetchSportsMapper(),
      sportsService.fetchLeaguesMapper(),
      curatedLeagueService.listCuratedPublic(normalizedSportId, { light: true }),
      fetchMarketsForStatus(status),
      marketTypeConfigService.listEnabledKeys(),
    ]);

    const curationActive = curatedRows.length > 0;
    const allowedLeagueIds = curationActive
      ? curatedRows.map((row) => String(row.overtimeLeagueId))
      : null;

    const result = {
      marketTypes,
      sports,
      leagues,
      markets,
      enabledMarketTypes,
      curation: {
        active: curationActive,
        rows: curatedRows,
        allowedLeagueIds,
      },
    };

    cache.set(cacheKey, result, BOOTSTRAP_TTL_MS);
    return result;
  },
};
