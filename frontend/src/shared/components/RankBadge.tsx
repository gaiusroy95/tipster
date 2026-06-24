import { cn } from '@/shared/utils/cn'

export const RANK_MEDAL_SRC = {
  1: '/assets/medal/gold.png',
  2: '/assets/medal/silver.png',
  3: '/assets/medal/bronze.png',
} as const

export const TIER_SHIELD_SRC = {
  champion: '/assets/medal/champion.png',
  expert: '/assets/medal/expert.png',
  pro: '/assets/medal/pro.png',
  rising: '/assets/medal/rising.png',
} as const

export type RankTierKey = keyof typeof TIER_SHIELD_SRC

export type PodiumRank = 1 | 2 | 3

export function isPodiumRank(rank: number): rank is PodiumRank {
  return rank === 1 || rank === 2 || rank === 3
}

export function getRankTierKey(rank: number): RankTierKey {
  if (rank <= 10) return 'champion'
  if (rank <= 50) return 'expert'
  if (rank <= 200) return 'pro'
  return 'rising'
}

export function getTierShieldSrc(rank: number): string {
  return TIER_SHIELD_SRC[getRankTierKey(rank)]
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
  if (rank <= 10) {
    return cn(
      'border-accent-gold/25 bg-gradient-to-r from-accent-gold/8 via-transparent to-transparent',
      interactive && 'hover:from-accent-gold/12',
    )
  }
  if (rank <= 50) {
    return cn(
      'border-accent-secondary/30 bg-gradient-to-r from-accent-secondary/8 via-transparent to-transparent',
      interactive && 'hover:from-accent-secondary/12',
    )
  }
  if (rank <= 200) {
    return cn(
      'border-accent-win/25 bg-gradient-to-r from-accent-win/8 via-transparent to-transparent',
      interactive && 'hover:from-accent-win/12',
    )
  }
  return cn(
    'border-border-default bg-bg-surface',
    interactive && 'hover:bg-bg-elevated',
  )
}

type RankBadgeSize = 'sm' | 'md' | 'lg' | 'xl'

const medalSizeClass: Record<RankBadgeSize, string> = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
  xl: 'h-14 w-14 sm:h-16 sm:w-16',
}

const shieldRankTextClass: Record<RankBadgeSize, string> = {
  sm: 'text-[9px] leading-none',
  md: 'text-[11px] leading-none',
  lg: 'text-sm leading-none',
  xl: 'text-sm leading-none',
}

const shieldRankTextLargeClass: Record<RankBadgeSize, string> = {
  sm: 'text-[7px] leading-none',
  md: 'text-[9px] leading-none',
  lg: 'text-[11px] leading-none',
  xl: 'text-[11px] leading-none',
}

interface RankBadgeProps {
  rank: number
  size?: RankBadgeSize
  className?: string
}

const shieldHexInsetClass = 'left-[27%] right-[27%] top-[23%] bottom-[39%]'

/** Gold / silver / bronze medals — hex center sits lower (crown + ribbons). */
const podiumHexInsetClass = 'left-[36%] right-[36%] top-[30%] bottom-[42%]'

const podiumRankTextClass: Record<RankBadgeSize, string> = {
  sm: 'text-[8px] leading-none',
  md: 'text-[10px] leading-none',
  lg: 'text-xs leading-none',
  xl: 'text-sm sm:text-base leading-none',
}

function MedalRankOverlay({
  insetClass,
  rankLabel,
  textClassName,
}: {
  insetClass: string
  rankLabel: string
  textClassName: string
}) {
  return (
    <span className={cn('absolute flex items-center justify-center', insetClass)}>
      <span className={cn('font-bold font-mono tabular-nums', textClassName)}>
        {rankLabel}
      </span>
    </span>
  )
}

function TierShieldBadge({
  rank,
  size,
  className,
}: {
  rank: number
  size: RankBadgeSize
  className?: string
}) {
  const tier = getRankTierKey(rank)
  const rankLabel = rank > 999 ? '999+' : String(rank)
  const isWideRank = rank > 99

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
        src={TIER_SHIELD_SRC[tier]}
        alt=""
        className="h-full w-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]"
        width={48}
        height={48}
      />
      <MedalRankOverlay
        insetClass={shieldHexInsetClass}
        rankLabel={rankLabel}
        textClassName={cn(
          isWideRank ? shieldRankTextLargeClass[size] : shieldRankTextClass[size],
          'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]',
          tier === 'rising' && 'text-text-primary drop-shadow-[0_1px_1px_rgba(255,255,255,0.35)]',
        )}
      />
    </div>
  )
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
        <MedalRankOverlay
          insetClass={podiumHexInsetClass}
          rankLabel={String(rank)}
          textClassName={cn(
            podiumRankTextClass[size],
            'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]',
          )}
        />
      </div>
    )
  }

  return <TierShieldBadge rank={rank} size={size} className={className} />
}
