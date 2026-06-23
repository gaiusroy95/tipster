import { sportsClient } from '@/core/api/sportsClient'
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
import type {
  OvertimeLeagueGroup,
  OvertimeLiveMarketsResponse,
  OvertimeMarketsResponse,
  OvertimeMarketTypeMeta,
  OvertimeSportMeta,
} from '@/features/fixtures/types/overtime'

const NETWORK_ID = 10

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
  const { data } = await sportsClient.get<Record<string, OvertimeLeagueGroup[]>>('/sports/leagues')
  return mapLeaguesResponse(data, sportId)
}

export async function fetchFixturesFromApi(filters?: {
  leagueId?: string
  status?: string
  sportId?: string
}): Promise<MatchWithTeams[]> {
  const typeById = await getMarketTypes()
  const sportsCatalog = await getSportsCatalog()
  const status = filters?.status ?? MATCH_STATUS.SCHEDULED

  if (status === MATCH_STATUS.LIVE) {
    const liveMarkets = await fetchLiveMarketsRaw()
    const matches = liveMarkets.map((live) =>
      mapOvertimeMarketToMatch(live, [], typeById, sportsCatalog, live, status),
    )
    return filterBySportAndLeague(matches, filters?.sportId, filters?.leagueId)
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
      if (!primary.isResolved && primary.statusCode !== 'resolved') continue
    }

    const related = gameMarkets.filter((m) => m !== primary)
    matches.push(
      mapOvertimeMarketToMatch(primary, related, typeById, sportsCatalog, undefined, status),
    )
  }

  return filterBySportAndLeague(matches, filters?.sportId, filters?.leagueId).sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
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
