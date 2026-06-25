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

export function filterLeagues(
  leagues: CuratedLeague[],
  filter: LeagueFilter,
  search: string,
) {
  let result = leagues

  if (filter === 'enabled') result = result.filter((l) => l.isEnabled)
  if (filter === 'disabled') result = result.filter((l) => !l.isEnabled)

  const q = search.trim().toLowerCase()
  if (q) {
    result = result.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.country.toLowerCase().includes(q) ||
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
