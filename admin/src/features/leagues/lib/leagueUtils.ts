export interface CuratedLeague {
  id: string
  overtimeLeagueId: number
  name: string
  country: string
  sportId: string
  isEnabled: boolean
  sortOrder: number
  matchCount: number
}

export const SPORT_CATALOG = [
  { id: 'soccer', name: 'Soccer' },
  { id: 'basketball', name: 'Basketball' },
  { id: 'volleyball', name: 'Volleyball' },
  { id: 'tennis', name: 'Tennis' },
  { id: 'hockey', name: 'Hockey' },
  { id: 'baseball', name: 'Baseball' },
  { id: 'mma', name: 'MMA' },
  { id: 'esports', name: 'Esports' },
] as const

export type LeagueFilter = 'all' | 'enabled' | 'disabled'

export type LeagueSportFilter = 'all' | string

export type LeagueSort = 'rank' | 'name-asc' | 'name-desc' | 'country'

export const LEAGUE_SORT_OPTIONS: { id: LeagueSort; label: string }[] = [
  { id: 'rank', label: 'Rank #1 first' },
  { id: 'name-asc', label: 'Name A → Z' },
  { id: 'name-desc', label: 'Name Z → A' },
  { id: 'country', label: 'Country A → Z' },
]

const SPORT_LABELS: Record<string, string> = Object.fromEntries(
  SPORT_CATALOG.map((sport) => [sport.id, sport.name]),
)

const SPORT_ACCENTS: Record<string, string> = {
  soccer: 'border-accent-win/30 bg-accent-win/10 text-accent-win',
  basketball: 'border-accent-primary/30 bg-accent-primary/10 text-accent-primary',
  volleyball: 'border-accent-secondary/30 bg-accent-secondary/10 text-accent-secondary',
  tennis: 'border-lime-400/30 bg-lime-400/10 text-lime-300',
  hockey: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  baseball: 'border-orange-400/30 bg-orange-400/10 text-orange-300',
  mma: 'border-accent-loss/30 bg-accent-loss/10 text-accent-loss',
  esports: 'border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300',
}

export function summarizeLeagues(leagues: CuratedLeague[]) {
  const enabled = leagues.filter((l) => l.isEnabled).length
  return {
    total: leagues.length,
    enabled,
    disabled: leagues.length - enabled,
  }
}

export function listLeagueSports(leagues: CuratedLeague[]) {
  return [...new Set(leagues.map((l) => l.sportId))].sort((a, b) => a.localeCompare(b))
}

export function listSportFilterOptions(leagues: CuratedLeague[]) {
  const inCatalog = new Set(leagues.map((l) => l.sportId))
  const known = SPORT_CATALOG.filter((sport) => inCatalog.has(sport.id))
  const extras = [...inCatalog]
    .filter((id) => !SPORT_CATALOG.some((sport) => sport.id === id))
    .sort((a, b) => a.localeCompare(b))
    .map((id) => ({ id, name: formatSportLabel(id) }))

  return [...known, ...extras]
}

export function formatSportLabel(sportId: string) {
  if (SPORT_LABELS[sportId]) return SPORT_LABELS[sportId]
  return sportId
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function getSportAccentClass(sportId: string) {
  return (
    SPORT_ACCENTS[sportId] ??
    'border-border-default/70 bg-bg-elevated/50 text-text-muted'
  )
}

/** Sidebar priority as human rank #1, #2, … (lower sortOrder = higher rank). */
export function buildLeagueRankMap(leagues: CuratedLeague[]) {
  const sorted = [...leagues].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  )
  return new Map(sorted.map((league, index) => [league.id, index + 1]))
}

export function filterLeagues(
  leagues: CuratedLeague[],
  filter: LeagueFilter,
  search: string,
  sportFilter: LeagueSportFilter = 'all',
) {
  let result = leagues

  if (filter === 'enabled') result = result.filter((l) => l.isEnabled)
  if (filter === 'disabled') result = result.filter((l) => !l.isEnabled)
  if (sportFilter !== 'all') result = result.filter((l) => l.sportId === sportFilter)

  const q = search.trim().toLowerCase()
  if (q) {
    result = result.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.country.toLowerCase().includes(q) ||
        l.sportId.toLowerCase().includes(q) ||
        String(l.overtimeLeagueId).includes(q),
    )
  }

  return result
}

export function sortLeagues(leagues: CuratedLeague[], sort: LeagueSort) {
  const copy = [...leagues]

  switch (sort) {
    case 'rank':
      return copy.sort(
        (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
      )
    case 'name-asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    case 'name-desc':
      return copy.sort((a, b) => b.name.localeCompare(a.name))
    case 'country':
      return copy.sort(
        (a, b) =>
          a.country.localeCompare(b.country) || a.name.localeCompare(b.name),
      )
  }
}
