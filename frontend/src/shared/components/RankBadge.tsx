import { cn } from '@/shared/utils/cn'

export const RANK_MEDAL_SRC = {
  1: '/assets/medal/gold.png',
  2: '/assets/medal/silver.png',
  3: '/assets/medal/bronze.png',
} as const

export type PodiumRank = 1 | 2 | 3

export function isPodiumRank(rank: number): rank is PodiumRank {
  return rank === 1 || rank === 2 || rank === 3
}

export function getRankRowClass(rank: number, interactive = true): string {
  if (rank === 1) {
    return cn(
      'border-accent-gold/40 bg-gradient-to-r from-accent-gold/14 via-accent-gold/6 to-transparent',
      interactive && 'hover:from-accent-gold/18',
    )
  }
  if (rank === 2) {
    return cn(
      'border-white/25 bg-gradient-to-r from-white/10 via-white/5 to-transparent',
      interactive && 'hover:from-white/14',
    )
  }
  if (rank === 3) {
    return cn(
      'border-amber-600/35 bg-gradient-to-r from-amber-700/18 via-amber-700/8 to-transparent',
      interactive && 'hover:from-amber-700/22',
    )
  }
  return cn(
    'border-border-default bg-bg-surface',
    interactive && 'hover:bg-bg-elevated',
  )
}

type RankBadgeSize = 'sm' | 'md' | 'lg'

const medalSizeClass: Record<RankBadgeSize, string> = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
}

const numericSizeClass: Record<RankBadgeSize, string> = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-9 w-9 text-sm',
}

interface RankBadgeProps {
  rank: number
  size?: RankBadgeSize
  className?: string
}

export function RankBadge({ rank, size = 'md', className }: RankBadgeProps) {
  if (isPodiumRank(rank)) {
    return (
      <div
        className={cn(
          'relative flex shrink-0 items-center justify-center',
          medalSizeClass[size],
          className,
        )}
        aria-label={`Rank ${rank}`}
      >
        <img
          src={RANK_MEDAL_SRC[rank]}
          alt=""
          className="h-full w-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]"
          width={48}
          height={48}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-bold font-mono bg-bg-elevated text-text-muted',
        numericSizeClass[size],
        className,
      )}
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </div>
  )
}
