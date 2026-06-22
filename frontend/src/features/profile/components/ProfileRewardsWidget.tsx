import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  ChevronRightIcon,
  FireIcon,
  GiftIcon,
  SparklesIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import { ROUTES } from '@/core/constants/routes'
import { computeStreaks } from '@/features/profile/lib/profileUtils'
import { formatCredits } from '@/shared/utils/formatCredits'
import { cn } from '@/shared/utils/cn'
import type { DashboardData, UserProfileStats } from '@/mocks/data/types'

const STREAK_SLOTS = 15
const STREAK_BONUS_TARGET = 5
const FORUM_VIEW_TARGET = 1000

interface ProfileRewardsWidgetProps {
  profile: UserProfileStats
  dashboard?: DashboardData
  variant?: 'full' | 'compact'
  className?: string
}

export function ProfileRewardsWidget({
  profile,
  dashboard,
  variant = 'full',
  className,
}: ProfileRewardsWidgetProps) {
  const { currentWin } = computeStreaks(profile.form)
  const dailyRank = dashboard?.rank ?? profile.rank
  const todayPl = dashboard?.todayProfitLoss ?? 0
  const forumViews = 0
  const forumProgress = Math.min(100, (forumViews / FORUM_VIEW_TARGET) * 100)
  const isRanked = dailyRank <= 500

  const header = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-base sm:text-lg font-bold tracking-tight">
            Arena rewards
          </h2>
          <span className="hidden sm:inline-flex items-center rounded-full bg-accent-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-primary">
            Live
          </span>
        </div>
        <p className="text-xs text-text-muted mt-0.5">Rewards stats & daily progress</p>
      </div>
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-primary/25 to-accent-secondary/25 border border-accent-primary/20"
        aria-hidden="true"
      >
        <GiftIcon className="h-5 w-5 text-accent-primary" />
      </div>
    </div>
  )

  const rankingBlock = (
    <RewardStatBlock
      icon={TrophyIcon}
      iconClass="text-accent-gold bg-accent-gold/15"
      label="My daily ranking"
      compact={variant === 'compact'}
    >
      <p className={cn(
        'font-mono font-bold tabular-nums',
        variant === 'compact' ? 'text-lg' : 'text-xl sm:text-2xl',
        isRanked ? 'text-accent-gold' : 'text-text-muted',
      )}>
        {isRanked ? `#${dailyRank}` : 'Not ranked'}
      </p>
      <Link
        to={`${ROUTES.HOME}?tab=cup`}
        className="inline-flex items-center gap-0.5 mt-2 text-xs font-semibold text-accent-secondary hover:text-accent-primary transition-colors group"
      >
        Play now
        <ChevronRightIcon className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </RewardStatBlock>
  )

  const forumBlock = (
    <RewardStatBlock
      icon={SparklesIcon}
      iconClass="text-accent-secondary bg-accent-secondary/15"
      label="Forum views"
      compact={variant === 'compact'}
    >
      <p className={cn(
        'font-mono font-bold tabular-nums text-text-primary',
        variant === 'compact' ? 'text-lg' : 'text-xl sm:text-2xl',
      )}>
        {forumViews.toLocaleString()}
        <span className="text-text-muted font-normal text-sm"> / {FORUM_VIEW_TARGET.toLocaleString()}</span>
      </p>
      <div className="mt-2.5 h-1.5 rounded-full bg-bg-elevated overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-secondary to-accent-primary transition-all duration-500"
          style={{ width: `${forumProgress}%` }}
        />
      </div>
      <Link
        to={ROUTES.TERMS}
        className="inline-flex items-center gap-0.5 mt-2 text-xs font-semibold text-accent-secondary hover:text-accent-primary transition-colors group"
      >
        Post now
        <ChevronRightIcon className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </RewardStatBlock>
  )

  const todayBlock = (
    <RewardStatBlock
      icon={FireIcon}
      iconClass="text-accent-primary bg-accent-primary/15"
      label="Today P/L"
      compact={variant === 'compact'}
    >
      <p className={cn(
        'font-mono font-bold tabular-nums',
        variant === 'compact' ? 'text-lg' : 'text-xl sm:text-2xl',
        todayPl >= 0 ? 'text-accent-win' : 'text-accent-loss',
      )}>
        {formatCredits(todayPl)}
      </p>
      <p className="text-[11px] text-text-muted mt-1.5">Virtual credits only</p>
    </RewardStatBlock>
  )

  const streakBlock = (
    <div className={cn(
      'rounded-xl border border-border-default/70 bg-bg-primary/30',
      variant === 'compact' ? 'p-3' : 'p-4 sm:p-5',
    )}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-primary/15">
            <FireIcon className="h-4 w-4 text-accent-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">Arena win streak</p>
            <p className="text-[11px] text-text-muted">
              {currentWin} win{currentWin !== 1 ? 's' : ''} · {STREAK_BONUS_TARGET}-win bonus
            </p>
          </div>
        </div>
        {currentWin >= STREAK_BONUS_TARGET && (
          <span className="shrink-0 rounded-full bg-accent-win/15 px-2 py-0.5 text-[10px] font-bold uppercase text-accent-win">
            Bonus
          </span>
        )}
      </div>
      <div className={cn(
        'flex gap-1.5',
        variant === 'compact' ? 'flex-wrap' : 'overflow-x-auto pb-1 horizontal-scroll-strip -mx-1 px-1',
      )}>
        {Array.from({ length: STREAK_SLOTS }).map((_, i) => {
          const filled = i < currentWin
          const isBonusSlot = i < STREAK_BONUS_TARGET
          return (
            <div
              key={i}
              className={cn(
                'flex shrink-0 items-center justify-center rounded-full border transition-all',
                variant === 'compact' ? 'h-7 w-7' : 'h-9 w-9 sm:h-10 sm:w-10',
                filled && isBonusSlot
                  ? 'border-accent-primary/50 bg-gradient-to-br from-accent-primary/30 to-accent-secondary/20 shadow-[0_0_12px_rgba(var(--accent-primary-rgb),0.25)]'
                  : filled
                    ? 'border-accent-secondary/40 bg-accent-secondary/15'
                    : 'border-border-default/80 bg-bg-elevated/50',
              )}
              title={`Day ${i + 1}`}
            >
              {filled ? (
                <FireIcon
                  className={cn(
                    variant === 'compact' ? 'h-3.5 w-3.5' : 'h-4 w-4',
                    isBonusSlot ? 'text-accent-primary' : 'text-accent-secondary',
                  )}
                  aria-hidden="true"
                />
              ) : (
                <span className={cn(
                  'font-mono font-bold text-text-muted/50',
                  variant === 'compact' ? 'text-[9px]' : 'text-[10px]',
                )}>
                  {i + 1}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  const footer = (
    <p className="text-[11px] text-text-muted leading-relaxed border-t border-border-default/50 pt-3">
      <Link to={ROUTES.TERMS} className="text-accent-secondary hover:underline font-medium">
        Read the game rules
      </Link>
      {' '}to stay on top of the arena rankings and rewards.
    </p>
  )

  if (variant === 'compact') {
    return (
      <section className={cn('sidebar-panel p-4 space-y-3', className)}>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">Arena rewards</h2>
          <GiftIcon className="h-4 w-4 text-accent-primary shrink-0" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          {rankingBlock}
          {todayBlock}
        </div>
        {streakBlock}
      </section>
    )
  }

  return (
    <section className={cn('sidebar-panel overflow-hidden', className)}>
      <div className="p-4 sm:p-5 space-y-5 bg-gradient-to-br from-accent-secondary/5 via-bg-surface to-accent-primary/5">
        {header}
        <div className="grid gap-3 sm:grid-cols-3">
          {rankingBlock}
          {forumBlock}
          {todayBlock}
        </div>
      </div>
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-4 border-t border-border-default/50 bg-bg-surface/50">
        {streakBlock}
        {footer}
      </div>
    </section>
  )
}

function RewardStatBlock({
  icon: Icon,
  iconClass,
  label,
  compact,
  children,
}: {
  icon: typeof TrophyIcon
  iconClass: string
  label: string
  compact?: boolean
  children: ReactNode
}) {
  return (
    <div className={cn(
      'rounded-xl border border-border-default/70 bg-bg-surface/80 backdrop-blur-sm',
      compact ? 'p-3' : 'p-4',
    )}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', iconClass)}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{label}</p>
      </div>
      {children}
    </div>
  )
}
