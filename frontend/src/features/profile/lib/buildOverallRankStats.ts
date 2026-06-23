import type { OverallRankStats } from '@/mocks/data/types'
import {
  nextTierTargetRank,
  overallRankTier,
  rankPercentile,
  tierProgress,
} from '@/features/profile/lib/overallRank'

export const DISPLAY_TOTAL_PLAYERS = 3088

export function buildOverallRankStats(
  currentRank: number,
  seasonPoints: number,
  options?: { bestRank?: number; rankChange?: number; totalPlayers?: number },
): OverallRankStats {
  const totalPlayers = options?.totalPlayers ?? DISPLAY_TOTAL_PLAYERS
  const best = options?.bestRank ?? currentRank
  const rankChange = options?.rankChange ?? 0
  const target = nextTierTargetRank(currentRank)
  const nextTier = overallRankTier(target)
  const currentTier = overallRankTier(currentRank)
  const progress = tierProgress(currentRank)
  const ranksToNext = currentRank <= target ? 0 : currentRank - target

  return {
    current: currentRank,
    best,
    totalPlayers,
    rankChange,
    seasonPoints,
    percentile: rankPercentile(currentRank, totalPlayers),
    tierLabel: currentTier.label,
    ranksToNextTier: ranksToNext,
    nextTierLabel: nextTier.label,
    tierProgressPercent: progress,
  }
}
