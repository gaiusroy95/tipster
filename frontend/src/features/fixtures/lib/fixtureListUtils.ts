import { MARKET_TYPES } from '@/core/constants/markets'
import type { MatchWithTeams } from '@/features/fixtures/types/fixture'

export type MatchSortId = 'kickoff_asc' | 'kickoff_desc' | 'league_asc' | 'team_asc' | 'odds_desc'

export type MatchTimeFilter = 'all' | 'today' | 'tomorrow' | 'week'

export const MATCH_SORT_OPTIONS: { id: MatchSortId; label: string }[] = [
  { id: 'kickoff_asc', label: 'Kickoff (earliest)' },
  { id: 'kickoff_desc', label: 'Kickoff (latest)' },
  { id: 'league_asc', label: 'League A–Z' },
  { id: 'team_asc', label: 'Team A–Z' },
  { id: 'odds_desc', label: 'Top odds' },
]

export const MATCH_TIME_FILTER_OPTIONS: { id: MatchTimeFilter; label: string }[] = [
  { id: 'all', label: 'All dates' },
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'week', label: 'Next 7 days' },
]

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function matchesTimeFilter(startTime: string, filter: MatchTimeFilter): boolean {
  if (filter === 'all') return true

  const kickoff = new Date(startTime)
  if (Number.isNaN(kickoff.getTime())) return true

  const now = new Date()
  const today = startOfDay(now)
  const tomorrow = addDays(today, 1)

  switch (filter) {
    case 'today':
      return isSameCalendarDay(kickoff, now)
    case 'tomorrow':
      return isSameCalendarDay(kickoff, tomorrow)
    case 'week': {
      const end = addDays(today, 7)
      return kickoff >= today && kickoff < end
    }
    default:
      return true
  }
}

function bestWinnerOdds(match: MatchWithTeams): number {
  const winner = match.markets.find((m) => m.marketType === MARKET_TYPES.WINNER)
  if (!winner?.selections.length) return 0
  return Math.max(...winner.selections.map((sel) => sel.value))
}

export function filterMatchList(
  matches: MatchWithTeams[],
  opts: {
    search?: string
    timeFilter?: MatchTimeFilter
  },
): MatchWithTeams[] {
  const query = opts.search?.trim().toLowerCase()
  const timeFilter = opts.timeFilter ?? 'all'

  return matches.filter((match) => {
    if (!matchesTimeFilter(match.startTime, timeFilter)) return false

    if (!query) return true

    const haystack = [
      match.homeTeam.name,
      match.homeTeam.shortName,
      match.awayTeam.name,
      match.awayTeam.shortName,
      match.league.name,
      match.league.country,
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(query)
  })
}

export function sortMatchList(matches: MatchWithTeams[], sort: MatchSortId): MatchWithTeams[] {
  const sorted = [...matches]

  sorted.sort((a, b) => {
    switch (sort) {
      case 'kickoff_desc':
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      case 'league_asc': {
        const leagueCmp = a.league.name.localeCompare(b.league.name)
        if (leagueCmp !== 0) return leagueCmp
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      }
      case 'team_asc': {
        const teamCmp = a.homeTeam.name.localeCompare(b.homeTeam.name)
        if (teamCmp !== 0) return teamCmp
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      }
      case 'odds_desc': {
        const oddsCmp = bestWinnerOdds(b) - bestWinnerOdds(a)
        if (oddsCmp !== 0) return oddsCmp
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      }
      case 'kickoff_asc':
      default:
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    }
  })

  return sorted
}

export function applyMatchListControls(
  matches: MatchWithTeams[],
  opts: {
    search?: string
    timeFilter?: MatchTimeFilter
    sort?: MatchSortId
  },
): MatchWithTeams[] {
  const filtered = filterMatchList(matches, opts)
  return sortMatchList(filtered, opts.sort ?? 'kickoff_asc')
}
