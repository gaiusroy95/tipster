import { rankTier } from '@/features/profile/lib/profileUtils'

export function nextTierTargetRank(rank: number): number {
  if (rank <= 10) return 10
  if (rank <= 50) return 10
  if (rank <= 200) return 50
  return 200
}

export function tierProgress(rank: number): number {
  if (rank <= 10) return 100
  if (rank <= 50) {
    return Math.min(100, Math.round(((50 - rank) / 40) * 100))
  }
  if (rank <= 200) {
    return Math.min(100, Math.round(((200 - rank) / 150) * 100))
  }
  const cap = 500
  const clamped = Math.min(rank, cap)
  return Math.min(100, Math.round(((cap - clamped) / (cap - 200)) * 100))
}

export function rankPercentile(rank: number, totalPlayers: number): number {
  if (totalPlayers <= 1) return 100
  return Math.max(1, Math.min(99, Math.round((1 - (rank - 1) / totalPlayers) * 100)))
}

export function formatRankChange(change: number): { label: string; positive: boolean; neutral: boolean } {
  if (change > 0) return { label: `↑${change}`, positive: true, neutral: false }
  if (change < 0) return { label: `↓${Math.abs(change)}`, positive: false, neutral: false }
  return { label: '—', positive: false, neutral: true }
}

export function overallRankTier(rank: number) {
  return rankTier(rank)
}
