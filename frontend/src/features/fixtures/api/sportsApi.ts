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
import { sportIdMatchesCategory, normalizeSportId } from '@/features/fixtures/lib/mapOvertimeSport'
import { getLeagueLogoSrc } from '@/core/constants/leagueLogos'
import { SPORT_CATEGORIES, type SportCategory } from '@/core/constants/sports'
import {
  filterMatchesWithDisplayableOdds,
} from '@/features/fixtures/lib/matchOdds'
import {
  clearEnabledMarketTypesCache,
  filterMatchMarkets,
  filterMatchesByEnabledMarkets,
  setEnabledMarketTypes,
} from '@/features/fixtures/lib/enabledMarketTypes'
import type {
  OvertimeLeagueGroup,
  OvertimeLiveMarketsResponse,
  OvertimeMarketsResponse,
  OvertimeMarketTypeMeta,
  OvertimeSportMeta,
  OvertimeMarket,
  OvertimeLiveMarket,
} from '@/features/fixtures/types/overtime'

interface ArenaBootstrapCuration {
  active: boolean
  rows: CuratedLeagueRow[]
  allowedLeagueIds: string[] | null
}

export interface ArenaBootstrapPayload {
  marketTypes: Record<string, OvertimeMarketTypeMeta>
  sports: Record<string, OvertimeSportMeta>
  leagues: Record<string, OvertimeLeagueGroup[]>
  markets: OvertimeMarket[]
  enabledMarketTypes: string[]
  curation: ArenaBootstrapCuration
}

function curationScopeFromBootstrap(
  curation: ArenaBootstrapCuration,
  sportId?: string,
): CurationScope {
  const normalizedSportId = sportId ? normalizeSportId(sportId) : undefined
  const rows = normalizedSportId
    ? curation.rows.filter((row) => normalizeSportId(row.sportId) === normalizedSportId)
    : curation.rows

  if (!curation.active) {
    return { active: false, rows, allowedLeagueIds: null }
  }

  return {
    active: true,
    rows,
    allowedLeagueIds: new Set(
      curation.allowedLeagueIds ?? rows.map((row) => String(row.overtimeLeagueId)),
    ),
  }
}

function applyBootstrapPayload(payload: ArenaBootstrapPayload) {
  cachedMarketTypes = normalizeMarketTypes(payload.marketTypes)
  cachedSportsCatalog = normalizeSportsCatalog(payload.sports)
  curatedLeaguesCache.light = payload.curation.rows
  if (Array.isArray(payload.enabledMarketTypes)) {
    setEnabledMarketTypes(payload.enabledMarketTypes)
  }
}

async function ensureEnabledMarketTypesLoaded(): Promise<void> {
  try {
    const { data } = await apiClient.get<ApiResponse<{ marketTypes: string[] }>>(
      '/market-types/enabled',
    )
    if (Array.isArray(data.data?.marketTypes)) {
      setEnabledMarketTypes(data.data.marketTypes)
    }
  } catch {
    // Keep defaults when the API is unavailable.
  }
}

function finalizeFixtureMatches(matches: MatchWithTeams[]): MatchWithTeams[] {
  return filterMatchesWithDisplayableOdds(filterMatchesByEnabledMarkets(matches))
}

function buildFixturesFromRawMarkets(
  rawMarkets: OvertimeMarket[],
  typeById: Record<number, OvertimeMarketTypeMeta>,
  sportsCatalog: Record<number, { sport: string; label: string }>,
  curationScope: CurationScope,
  filters?: { leagueId?: string; status?: string; sportId?: string },
  liveMarkets?: OvertimeLiveMarket[],
): MatchWithTeams[] {
  const status = filters?.status ?? MATCH_STATUS.SCHEDULED

  if (status === MATCH_STATUS.LIVE && liveMarkets) {
    const matches = liveMarkets.map((live) =>
      mapOvertimeMarketToMatch(live, [], typeById, sportsCatalog, live, status),
    )
    return finalizeFixtureMatches(
      applyCuratedMatchFilter(
        filterBySportAndLeague(matches, filters?.sportId, filters?.leagueId).sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        ),
        curationScope,
      ),
    )
  }

  const groups = groupMarketsByGameId(rawMarkets)
  const nowSec = Math.floor(Date.now() / 1000)
  const matches: MatchWithTeams[] = []

  for (const [, gameMarkets] of groups) {
    const primary = pickPrimaryMarket(gameMarkets)
    if (!primary) continue

    const sportCategory =
      primary.sport || sportsCatalog[primary.subLeagueId]?.sport || ''
    if (
      filters?.sportId &&
      sportCategory &&
      !sportIdMatchesCategory(filters.sportId, sportCategory)
    ) {
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
    return finalizeFixtureMatches(
      applyCuratedMatchFilter(
        filterBySportAndLeague(matches, filters?.sportId, filters?.leagueId).sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
        ),
        curationScope,
      ),
    )
  }

  return finalizeFixtureMatches(
    applyCuratedMatchFilter(
      filterBySportAndLeague(matches, filters?.sportId, filters?.leagueId).sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      ),
      curationScope,
    ),
  )
}

/** Single round-trip bootstrap for arena shell (metadata, markets, leagues, curation). */
export async function loadArenaBootstrap(
  sportId?: string,
  status = MATCH_STATUS.SCHEDULED,
): Promise<{ fixtures: MatchWithTeams[]; leagues: League[] }> {
  const { data } = await sportsClient.get<ArenaBootstrapPayload>('/sports/bootstrap', {
    params: { sportId, status },
    timeout: 45_000,
  })

  applyBootstrapPayload(data)

  const typeById = await getMarketTypes()
  const sportsCatalog = await getSportsCatalog()
  const curationScope = curationScopeFromBootstrap(data.curation, sportId)
  const liveMarkets =
    status === MATCH_STATUS.LIVE ? (data.markets as OvertimeLiveMarket[]) : undefined

  const fixtures = buildFixturesFromRawMarkets(
    data.markets,
    typeById,
    sportsCatalog,
    curationScope,
    { sportId, status },
    liveMarkets,
  )

  const leagues = applyCuratedLeagueFilter(
    mapLeaguesResponse(data.leagues, sportId),
    curationScope,
  )

  return { fixtures, leagues }
}

const NETWORK_ID = 10

let curatedLeaguesCache: { light?: CuratedLeagueRow[]; full?: CuratedLeagueRow[] } = {}
const curatedLeaguesInflight: Partial<Record<'light' | 'full', Promise<CuratedLeagueRow[]>>> = {}

export function clearCuratedLeaguesCache(): void {
  curatedLeaguesCache = {}
  clearEnabledMarketTypesCache()
}

export interface CuratedLeagueRow {
  id: string
  overtimeLeagueId: number
  name: string
  country: string
  sportId: string
  isEnabled: boolean
  sortOrder: number
  matchCount?: number
}

/** All admin-enabled curated leagues (any sport). */
async function fetchAllCuratedLeagues(options?: { light?: boolean }): Promise<CuratedLeagueRow[]> {
  const light = options?.light ?? false
  const cacheKey = light ? 'light' : 'full'

  if (curatedLeaguesCache[cacheKey]) return curatedLeaguesCache[cacheKey]!

  if (!curatedLeaguesInflight[cacheKey]) {
    curatedLeaguesInflight[cacheKey] = (async () => {
      try {
        const { data } = await apiClient.get<ApiResponse<CuratedLeagueRow[]>>('/leagues/curated', {
          params: light ? { light: 'true' } : undefined,
        })
        const rows = data.data ?? []
        curatedLeaguesCache[cacheKey] = rows
        return rows
      } catch {
        return []
      } finally {
        delete curatedLeaguesInflight[cacheKey]
      }
    })()
  }

  return curatedLeaguesInflight[cacheKey]!
}

type CurationScope = {
  /** At least one league is enabled in admin — strict filtering applies. */
  active: boolean
  /** Enabled curated rows for the requested sport (or all sports when sportId omitted). */
  rows: CuratedLeagueRow[]
  allowedLeagueIds: Set<string> | null
}

async function resolveCurationScope(sportId?: string): Promise<CurationScope> {
  const allEnabled = await fetchAllCuratedLeagues({ light: true })
  const active = allEnabled.length > 0
  const normalizedSportId = sportId ? normalizeSportId(sportId) : undefined
  const rows = normalizedSportId
    ? allEnabled.filter((row) => normalizeSportId(row.sportId) === normalizedSportId)
    : allEnabled

  if (!active) {
    return { active: false, rows, allowedLeagueIds: null }
  }

  return {
    active: true,
    rows,
    allowedLeagueIds: new Set(rows.map((row) => String(row.overtimeLeagueId))),
  }
}

function formatCuratedSportName(sportId: string): string {
  const known = SPORT_CATEGORIES.find((sport) => sport.id === sportId)
  if (known) return known.name

  return sportId
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export async function fetchCuratedSportCategories(): Promise<SportCategory[]> {
  const allEnabled = await fetchAllCuratedLeagues({ light: true })
  if (allEnabled.length === 0) return SPORT_CATEGORIES

  const sportIds = [...new Set(allEnabled.map((row) => normalizeSportId(row.sportId)))]
  const knownIds = new Set(SPORT_CATEGORIES.map((sport) => sport.id))

  const known = SPORT_CATEGORIES.filter((sport) => sportIds.includes(sport.id))
  const extras = sportIds
    .filter((id) => !knownIds.has(id))
    .sort((a, b) => a.localeCompare(b))
    .map((id) => ({ id, name: formatCuratedSportName(id) }))

  return [...known, ...extras]
}

function applyCuratedLeagueFilter(
  leagues: League[],
  scope: CurationScope,
): League[] {
  if (!scope.active) return leagues
  if (scope.rows.length === 0) return []

  const overtimeById = new Map(leagues.map((league) => [league.id, league]))

  return [...scope.rows]
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
    .map((row) => {
      const id = String(row.overtimeLeagueId)
      const fromOvertime = overtimeById.get(id)

      return {
        id,
        name: row.name,
        country: row.country,
        sportId: normalizeSportId(row.sportId),
        logoUrl: fromOvertime?.logoUrl ?? getLeagueLogoSrc(row.name),
      }
    })
}

function applyCuratedMatchFilter(matches: MatchWithTeams[], scope: CurationScope): MatchWithTeams[] {
  if (!scope.active || !scope.allowedLeagueIds) return matches
  if (scope.allowedLeagueIds.size === 0) return []
  return matches.filter((match) => scope.allowedLeagueIds!.has(match.leagueId))
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

/** Fire metadata fetches early so fixture mapping does not wait on them. */
export function warmupSportsApiCaches(): void {
  void getMarketTypes()
  void getSportsCatalog()
  void ensureEnabledMarketTypesLoaded()
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
  const normalizedSportId = sportId ? normalizeSportId(sportId) : undefined

  return matches.filter((match) => {
    if (normalizedSportId && normalizeSportId(match.league.sportId) !== normalizedSportId) {
      return false
    }
    if (leagueId && match.leagueId !== leagueId) return false
    return true
  })
}

export async function fetchLeaguesFromApi(sportId?: string): Promise<League[]> {
  const [{ data }, scope] = await Promise.all([
    sportsClient.get<Record<string, OvertimeLeagueGroup[]>>('/sports/leagues'),
    resolveCurationScope(sportId),
  ])
  const leagues = mapLeaguesResponse(data, sportId)
  return applyCuratedLeagueFilter(leagues, scope)
}

export async function fetchFixturesFromApi(filters?: {
  leagueId?: string
  status?: string
  sportId?: string
}): Promise<MatchWithTeams[]> {
  await ensureEnabledMarketTypesLoaded()
  const status = filters?.status ?? MATCH_STATUS.SCHEDULED

  if (status === MATCH_STATUS.LIVE) {
    const [typeById, sportsCatalog, curationScope, liveMarkets] = await Promise.all([
      getMarketTypes(),
      getSportsCatalog(),
      resolveCurationScope(filters?.sportId),
      fetchLiveMarketsRaw(),
    ])
    return buildFixturesFromRawMarkets(
      [],
      typeById,
      sportsCatalog,
      curationScope,
      filters,
      liveMarkets,
    )
  }

  const [typeById, sportsCatalog, curationScope, rawMarkets] = await Promise.all([
    getMarketTypes(),
    getSportsCatalog(),
    resolveCurationScope(filters?.sportId),
    status === MATCH_STATUS.FINISHED ? fetchResolvedMarkets() : fetchOpenMarkets(),
  ])

  return buildFixturesFromRawMarkets(
    rawMarkets as OvertimeMarket[],
    typeById,
    sportsCatalog,
    curationScope,
    { ...filters, status },
  )
}

export async function fetchMatchFromApi(gameId: string): Promise<MatchWithTeams | null> {
  await ensureEnabledMarketTypesLoaded()
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

    return filterMatchMarkets(
      mapOvertimeMarketToMatch(market, [], typeById, sportsCatalog, live),
    )
  } catch {
    return null
  }
}
