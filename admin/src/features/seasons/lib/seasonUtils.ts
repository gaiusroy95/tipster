import {
  daysRemaining,
  formatSeasonRange,
  seasonProgress,
} from '@/features/dashboard/lib/dashboardUtils'

export interface SeasonPrize {
  id: string
  rankFrom: number
  rankTo: number
  name: string
  description: string
  imageUrl?: string | null
}

export interface Season {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: string
  isActive: boolean
  prizes: SeasonPrize[]
}

export type SeasonFilter = 'all' | 'active' | 'upcoming' | 'completed'

export const SEASON_FILTER_OPTIONS: { id: SeasonFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Live' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Archived' },
]

export function summarizeSeasons(seasons: Season[]) {
  const active = seasons.find((s) => s.isActive) ?? null
  const prizeTiers = seasons.reduce((sum, s) => sum + s.prizes.length, 0)
  const upcoming = seasons.filter((s) => s.status === 'upcoming' && !s.isActive).length
  const archived = seasons.filter((s) => s.status === 'completed' && !s.isActive).length

  return {
    total: seasons.length,
    active,
    prizeTiers,
    upcoming,
    archived,
    daysLeft: active ? daysRemaining(active.endDate) : null,
    progress: active ? seasonProgress(active.startDate, active.endDate) : null,
  }
}

export function filterSeasons(seasons: Season[], filter: SeasonFilter, search: string) {
  let result = seasons

  if (filter === 'active') result = result.filter((s) => s.isActive)
  if (filter === 'upcoming') result = result.filter((s) => s.status === 'upcoming' && !s.isActive)
  if (filter === 'completed') result = result.filter((s) => s.status === 'completed' || (!s.isActive && s.status !== 'upcoming'))

  const q = search.trim().toLowerCase()
  if (q) {
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q),
    )
  }

  return result
}

export function sortSeasons(seasons: Season[]) {
  return [...seasons].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  })
}

export function formatSeasonDates(start: string, end: string) {
  return formatSeasonRange(start, end)
}

export function getSeasonProgress(start: string, end: string) {
  return seasonProgress(start, end)
}

export function getSeasonDaysLeft(end: string) {
  return daysRemaining(end)
}

export function formatRankRange(rankFrom: number, rankTo: number) {
  if (rankFrom === rankTo) return `#${rankFrom}`
  return `#${rankFrom}–${rankTo}`
}

export function getPrizeTierAccent(rankFrom: number) {
  if (rankFrom === 1) {
    return {
      badge: 'win' as const,
      card: 'border-accent-win/25 bg-gradient-to-br from-accent-win/10 via-accent-win/5 to-transparent',
      icon: 'text-accent-win',
      label: 'Champion tier',
    }
  }
  if (rankFrom <= 3) {
    return {
      badge: 'secondary' as const,
      card: 'border-accent-secondary/25 bg-gradient-to-br from-accent-secondary/10 via-accent-secondary/5 to-transparent',
      icon: 'text-accent-secondary',
      label: 'Podium tier',
    }
  }
  return {
    badge: 'default' as const,
    card: 'border-border-default/70 bg-bg-elevated/30',
    icon: 'text-text-muted',
    label: 'Reward tier',
  }
}

export function getStatusBadge(season: Season) {
  if (season.isActive) return { variant: 'win' as const, label: 'Live' }
  if (season.status === 'upcoming') return { variant: 'secondary' as const, label: 'Upcoming' }
  if (season.status === 'completed') return { variant: 'default' as const, label: 'Archived' }

  const now = Date.now()
  const endMs = new Date(season.endDate).getTime()
  const startMs = new Date(season.startDate).getTime()
  if (endMs < now) return { variant: 'default' as const, label: 'Archived' }
  if (startMs > now) return { variant: 'secondary' as const, label: 'Upcoming' }

  return { variant: 'default' as const, label: 'Archived' }
}

export function defaultSeasonDates() {
  const now = new Date()
  const end = new Date(now)
  end.setFullYear(end.getFullYear() + 1)
  return {
    startDate: now.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    defaultName: `Season ${now.getFullYear()}/${String(now.getFullYear() + 1).slice(-2)}`,
  }
}
