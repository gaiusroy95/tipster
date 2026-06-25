import { sportsClient } from '@/core/api/sportsClient'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import { MATCH_STATUS } from '@/core/constants/markets'
import type { League } from '@/mocks/data/types'
import type { MatchWithTeams } from '@/features/fixtures/types/fixture'
import {
  groupMarketsByGameId,
  mapLeaguesResponse,
  mapOvertimeMarketToMatch,
  normalizeMarketTypes,
  normalizeSportsCatalog,
  pickPrimaryMarket,
} from '@/features/fixtures/lib/mapOvertimeToFixtures'
import { sportIdMatchesCategory } from '@/features/fixtures/lib/mapOvertimeSport'
import {
  filterMatchesWithDisplayableOdds,
} from '@/features/fixtures/lib/matchOdds'
import type {
  OvertimeLeagueGroup,
  OvertimeLiveMarketsResponse,
  OvertimeMarketsResponse,
  OvertimeMarketTypeMeta,
  OvertimeSportMeta,
} from '@/features/fixtures/types/overtime'

const NETWORK_ID = 10

export interface CuratedLeagueRow {
  id: string
  overtimeLeagueId: number
  name: string
  country: string
  sportId: string
  isEnabled: boolean
  sortOrder: number
}

async function fetchCuratedLeagues(sportId?: string): Promise<CuratedLeagueRow[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<CuratedLeagueRow[]>>('/leagues/curated', {
      params: sportId ? { sportId } : undefined,
    })
    return data.data ?? []
  } catch {
    return []
  }
}

function applyCuratedLeagueFilter(leagues: League[], curated: CuratedLeagueRow[]): League[] {
  if (curated.length === 0) return leagues

  const byOvertimeId = new Map(curated.map((row) => [String(row.overtimeLeagueId), row]))

  return leagues
    .filter((league) => byOvertimeId.has(league.id))
    .map((league) => {
      const row = byOvertimeId.get(league.id)!
      return { ...league, name: row.name, country: row.country }
    })
    .sort((a, b) => {
      const sortA = byOvertimeId.get(a.id)?.sortOrder ?? 999
      const sortB = byOvertimeId.get(b.id)?.sortOrder ?? 999
      return sortA - sortB || a.name.localeCompare(b.name)
    })
}

function curatedLeagueIdSet(curated: CuratedLeagueRow[]): Set<string> | null {
  if (curated.length === 0) return null
  return new Set(curated.map((row) => String(row.overtimeLeagueId)))
}

let cachedMarketTypes: Record<number, OvertimeMarketTypeMeta> | null = null
let cachedSportsCatalog: Record<number, { sport: string; label: string }> | null = null

async function getMarketTypes() {
  if (cachedMarketTypes) return cachedMarketTypes
  const data = await sportsClient.get<Record<string, OvertimeMarketTypeMeta>>('/sports/market-types')
  cachedMarketTypes = normalizeMarketTypes(data.data)
  return cachedMarketTypes
}

async function getSportsCatalog() {
  if (cachedSportsCatalog) return cachedSportsCatalog
  const data = await sportsClient.get<Record<string, OvertimeSportMeta>>('/sports/sports')
  cachedSportsCatalog = normalizeSportsCatalog(data.data)
  return cachedSportsCatalog
}

function extractMarketsArray(payload: OvertimeMarketsResponse | unknown[]): unknown[] {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object' && 'markets' in payload) {
    const markets = (payload as OvertimeMarketsResponse).markets
    return Array.isArray(markets) ? markets : []
  }
  return []
}

async function fetchOpenMarkets() {
  const { data } = await sportsClient.get<OvertimeMarketsResponse | unknown[]>(
    `/sports/networks/${NETWORK_ID}/markets`,
    {
      params: {
        ungroup: true,
        onlyBasicProperties: true,
        includeHashInResponse: true,
        status: 'open',
        onlyMainMarkets: true,
        includeProofs: false,
      },
    },
  )
  return extractMarketsArray(data)
}

async function fetchResolvedMarkets() {
  try {
    const { data } = await sportsClient.get<OvertimeMarketsResponse | unknown[]>(
      `/sports/networks/${NETWORK_ID}/finished-markets`,
    )
    const markets = extractMarketsArray(data)
    if (markets.length > 0) return markets
  } catch {
    // Fall back to direct resolved query when finished-markets is unavailable.
  }

  try {
    const { data } = await sportsClient.get<OvertimeMarketsResponse | unknown[]>(
      `/sports/networks/${NETWORK_ID}/markets`,
      {
        params: {
          ungroup: true,
          onlyBasicProperties: true,
          status: 'resolved',
          onlyMainMarkets: true,
          includeProofs: false,
        },
      },
    )
    return extractMarketsArray(data)
  } catch {
    return []
  }
}

async function fetchLiveMarketsRaw() {
  const { data } = await sportsClient.get<OvertimeLiveMarketsResponse>(
    `/sports/networks/${NETWORK_ID}/live-markets`,
  )
  return data.markets ?? []
}

function filterBySportAndLeague(
  matches: MatchWithTeams[],
  sportId?: string,
  leagueId?: string,
): MatchWithTeams[] {
  return matches.filter((match) => {
    if (sportId && match.league.sportId !== sportId) return false
    if (leagueId && match.leagueId !== leagueId) return false
    return true
  })
}

export async function fetchLeaguesFromApi(sportId?: string): Promise<League[]> {
  const [{ data }, curated] = await Promise.all([
    sportsClient.get<Record<string, OvertimeLeagueGroup[]>>('/sports/leagues'),
    fetchCuratedLeagues(sportId),
  ])
  const leagues = mapLeaguesResponse(data, sportId)
  return applyCuratedLeagueFilter(leagues, curated)
}

export async function fetchFixturesFromApi(filters?: {
  leagueId?: string
  status?: string
  sportId?: string
}): Promise<MatchWithTeams[]> {
  const typeById = await getMarketTypes()
  const sportsCatalog = await getSportsCatalog()
  const status = filters?.status ?? MATCH_STATUS.SCHEDULED
  const curatedIds = curatedLeagueIdSet(await fetchCuratedLeagues(filters?.sportId))

  const applyCuratedMatchFilter = (matches: MatchWithTeams[]) => {
    if (!curatedIds) return matches
    return matches.filter((match) => curatedIds.has(match.leagueId))
  }

  if (status === MATCH_STATUS.LIVE) {
    const liveMarkets = await fetchLiveMarketsRaw()
    const matches = liveMarkets.map((live) =>
      mapOvertimeMarketToMatch(live, [], typeById, sportsCatalog, live, status),
    )
    return filterMatchesWithDisplayableOdds(
      applyCuratedMatchFilter(
        filterBySportAndLeague(matches, filters?.sportId, filters?.leagueId).sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        ),
      ),
    )
  }

  const rawMarkets =
    status === MATCH_STATUS.FINISHED ? await fetchResolvedMarkets() : await fetchOpenMarkets()

  const groups = groupMarketsByGameId(rawMarkets as import('@/features/fixtures/types/overtime').OvertimeMarket[])
  const nowSec = Math.floor(Date.now() / 1000)
  const matches: MatchWithTeams[] = []

  for (const [, gameMarkets] of groups) {
    const primary = pickPrimaryMarket(gameMarkets)
    if (!primary) continue

    const sportCategory =
      primary.sport || sportsCatalog[primary.subLeagueId]?.sport || ''
    if (filters?.sportId && sportCategory && !sportIdMatchesCategory(filters.sportId, sportCategory)) {
      continue
    }

    if (status === MATCH_STATUS.SCHEDULED) {
      if (primary.statusCode === 'ongoing') continue
      if (primary.isResolved || primary.statusCode === 'resolved') continue
      if (primary.maturity < nowSec) continue
    }

    if (status === MATCH_STATUS.FINISHED) {
      if (primary.statusCode === 'open' && !primary.isResolved) continue
    }

    const related = gameMarkets.filter((m) => m !== primary)
    matches.push(
      mapOvertimeMarketToMatch(primary, related, typeById, sportsCatalog, undefined, status),
    )
  }

  if (status === MATCH_STATUS.FINISHED) {
    return filterMatchesWithDisplayableOdds(
      applyCuratedMatchFilter(
        filterBySportAndLeague(matches, filters?.sportId, filters?.leagueId).sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
        ),
      ),
    )
  }

  return filterMatchesWithDisplayableOdds(
    applyCuratedMatchFilter(
      filterBySportAndLeague(matches, filters?.sportId, filters?.leagueId).sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      ),
    ),
  )
}

export async function fetchMatchFromApi(gameId: string): Promise<MatchWithTeams | null> {
  const typeById = await getMarketTypes()
  const sportsCatalog = await getSportsCatalog()

  try {
    const { data: market } = await sportsClient.get<
      import('@/features/fixtures/types/overtime').OvertimeMarket
    >(`/sports/networks/${NETWORK_ID}/markets/${encodeURIComponent(gameId)}`)

    let live: import('@/features/fixtures/types/overtime').OvertimeLiveMarket | undefined
    try {
      const liveMarkets = await fetchLiveMarketsRaw()
      live = liveMarkets.find((m) => m.gameId === gameId)
    } catch {
      live = undefined
    }

    return mapOvertimeMarketToMatch(market, [], typeById, sportsCatalog, live)
  } catch {
    return null
  }
}
