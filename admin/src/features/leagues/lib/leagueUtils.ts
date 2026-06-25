export interface CuratedLeague {
  id: string
  overtimeLeagueId: number
  name: string
  country: string
  sportId: string
  isEnabled: boolean
  sortOrder: number
}

export type LeagueFilter = 'all' | 'enabled' | 'disabled'

export type LeagueSportFilter = 'all' | string

export type LeagueSort = 'order' | 'name-asc' | 'name-desc' | 'country'

export const LEAGUE_SORT_OPTIONS: { id: LeagueSort; label: string }[] = [
  { id: 'order', label: 'Sidebar order' },
  { id: 'name-asc', label: 'Name A → Z' },
  { id: 'name-desc', label: 'Name Z → A' },
  { id: 'country', label: 'Country A → Z' },
]

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

export function formatSportLabel(sportId: string) {
  return sportId
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
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
    case 'order':
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
