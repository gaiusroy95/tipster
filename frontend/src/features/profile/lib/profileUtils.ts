import type { ProfileSocialStats, UserProfileStats } from '@/mocks/data/types'

export function socialStatsToGridValues(stats?: ProfileSocialStats) {
  return {
    Posts: stats?.posts ?? 0,
    Followers: stats?.followers ?? 0,
    Following: stats?.following ?? 0,
    Views: stats?.views ?? 0,
  }
}

export function resolveProfileSocialStats(
  socialStats?: ProfileSocialStats,
  fallback?: { postCount?: number; forumViewsTotal?: number },
): ProfileSocialStats {
  if (socialStats) return socialStats
  return {
    posts: fallback?.postCount ?? 0,
    followers: 0,
    following: 0,
    views: fallback?.forumViewsTotal ?? 0,
  }
}

export function rankTier(rank: number) {
  if (rank <= 0) {
    return { label: 'Newcomer', className: 'bg-bg-elevated text-text-muted border-border-default' }
  }
  if (rank <= 10) {
    return { label: 'Champion', className: 'bg-accent-gold/20 text-accent-gold border-accent-gold/40' }
  }
  if (rank <= 50) {
    return { label: 'Expert', className: 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary/40' }
  }
  if (rank <= 200) {
    return { label: 'Pro', className: 'bg-accent-win/15 text-accent-win border-accent-win/30' }
  }
  return { label: 'Rising', className: 'bg-bg-elevated text-text-muted border-border-default' }
}

export function computeStreaks(form: ('W' | 'L' | 'D')[]) {
  let currentWin = 0
  let longestWin = 0
  let longestLoss = 0
  let runWin = 0
  let runLoss = 0

  for (const result of form) {
    if (result === 'W') {
      runWin += 1
      runLoss = 0
      longestWin = Math.max(longestWin, runWin)
    } else if (result === 'L') {
      runLoss += 1
      runWin = 0
      longestLoss = Math.max(longestLoss, runLoss)
    } else {
      runWin = 0
      runLoss = 0
    }
  }

  for (let i = form.length - 1; i >= 0; i -= 1) {
    if (form[i] === 'W') currentWin += 1
    else break
  }

  return { currentWin, longestWin, longestLoss }
}

export function lastTenWinRate(form: ('W' | 'L' | 'D')[]) {
  const slice = form.slice(-10)
  if (slice.length === 0) return 0
  const wins = slice.filter((f) => f === 'W').length
  return Math.round((wins / slice.length) * 100)
}

export function hasBettingInsights(profile: UserProfileStats) {
  return profile.seasonStats.totalBets > 0 || profile.performanceHistory.length > 0
}

export const LEAGUE_MEDALS = [
  { id: 'bundesliga', name: 'Bundesliga', short: 'BL' },
  { id: 'epl', name: 'Premier League', short: 'EPL' },
  { id: 'laliga', name: 'La Liga', short: 'LL' },
  { id: 'seriea', name: 'Serie A', short: 'SA' },
  { id: 'ligue1', name: 'Ligue 1', short: 'L1' },
  { id: 'ucl', name: 'Champions League', short: 'UCL' },
] as const
