import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  ChevronRightIcon,
  FireIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { ROUTES } from '@/core/constants/routes'
import { PROFILE_ICON_EYE, PROFILE_ICON_OPEN_BETS, PROFILE_ICON_STREAK } from '@/core/constants/branding'
import { ProfileBalanceIcon } from '@/features/profile/components/ProfileBalanceIcon'
import { computeStreaks } from '@/features/profile/lib/profileUtils'
import { formatCredits } from '@/shared/utils/formatCredits'
import { cn } from '@/shared/utils/cn'
import type { DashboardData, UserProfileStats } from '@/mocks/data/types'

import { FORUM_VIEW_REWARD, FORUM_VIEW_TARGET } from '@/features/forum/types/forum'

const STREAK_BONUS_TARGET = 5
const STREAK_DISPLAY_SLOTS = 8
const REWARD_MISSION_ICON_CLASS = 'h-10 w-10 shrink-0'

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
  const forumViews = dashboard?.forumViewsProgress ?? 0
  const forumViewsTarget = dashboard?.forumViewsTarget ?? FORUM_VIEW_TARGET
  const forumBonusEarned = dashboard?.forumBonusEarned ?? 0
  const forumProgress = Math.min(100, (forumViews / forumViewsTarget) * 100)
  const forumViewsRemaining = dashboard?.forumViewsRemaining ?? forumViewsTarget
  const isRanked = dailyRank <= 500
  const winsToBonus =
    currentWin % STREAK_BONUS_TARGET === 0 && currentWin > 0
      ? STREAK_BONUS_TARGET
      : STREAK_BONUS_TARGET - (currentWin % STREAK_BONUS_TARGET)

  const rankingCard = (
    <RewardMissionCard
      title="My daily ranking"
      action={{ label: 'Play now', to: `${ROUTES.HOME}?tab=cup` }}
      footer="Finish in the daily Top 3 after rankings settle to earn virtual credits."
      compact={variant === 'compact'}
    >
      <div className="flex items-center gap-3 min-w-0">
        <ProfileBalanceIcon src={PROFILE_ICON_OPEN_BETS} className={REWARD_MISSION_ICON_CLASS} />
        <p className="font-semibold text-lg leading-tight text-accent-secondary">
          {isRanked ? `#${dailyRank}` : 'Not ranked'}
        </p>
      </div>
    </RewardMissionCard>
  )

  const forumCard = (
    <RewardMissionCard
      title="Forum views"
      action={{ label: 'Post now', to: ROUTES.FORUM }}
      footer={
        forumViewsRemaining > 0
          ? `You have earned ${formatCredits(forumBonusEarned)} so far. ${forumViewsRemaining.toLocaleString()} more views to earn ${formatCredits(FORUM_VIEW_REWARD)}.`
          : `View target reached — ${formatCredits(FORUM_VIEW_REWARD)} bonus credited.`
      }
      compact={variant === 'compact'}
    >
      <div className="flex items-center gap-3 min-w-0 text-accent-secondary">
        <ProfileBalanceIcon src={PROFILE_ICON_EYE} className={REWARD_MISSION_ICON_CLASS} alt="" />
        <p className="font-semibold text-base tabular-nums">
          {forumViews.toLocaleString()}
          <span className="text-text-muted font-normal"> / {forumViewsTarget.toLocaleString()} views</span>
        </p>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-bg-primary/80 overflow-hidden">
        <div
          className="h-full rounded-full bg-accent-secondary transition-all duration-500"
          style={{ width: `${forumProgress}%` }}
        />
      </div>
    </RewardMissionCard>
  )

  const streakCard = (
    <RewardMissionCard
      title="Arena win streak"
      action={{ label: 'Play now', to: `${ROUTES.HOME}?tab=cup` }}
      footer={
        winsToBonus > 0
          ? `${winsToBonus} more win${winsToBonus !== 1 ? 's' : ''} to earn another streak bonus.`
          : 'Streak bonus unlocked — keep winning to stack rewards.'
      }
      compact={variant === 'compact'}
    >
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        {Array.from({ length: STREAK_DISPLAY_SLOTS }).map((_, i) => {
          const filled = i < currentWin
          const inBonusTrack = i < STREAK_BONUS_TARGET
          return (
            <div
              key={i}
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
                filled
                  ? inBonusTrack
                    ? 'border-accent-secondary/50 bg-accent-secondary/20'
                    : 'border-accent-primary/40 bg-accent-primary/15'
                  : 'border-border-default/70 bg-bg-primary/50',
              )}
              title={`Win ${i + 1}`}
            >
              {filled ? (
                <FireIcon
                  className={cn(
                    'h-4 w-4',
                    inBonusTrack ? 'text-accent-secondary' : 'text-accent-primary',
                  )}
                  aria-hidden="true"
                />
              ) : (
                <span className="text-[10px] font-mono font-bold text-text-muted/40">{i + 1}</span>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-3 min-w-0 text-accent-secondary">
        <ProfileBalanceIcon src={PROFILE_ICON_STREAK} className={REWARD_MISSION_ICON_CLASS} alt="" />
        <p className="text-sm font-semibold tabular-nums">
          {currentWin} win{currentWin !== 1 ? 's' : ''} / {STREAK_BONUS_TARGET} win streak
        </p>
      </div>
    </RewardMissionCard>
  )

  const todayCard = (
    <RewardMissionCard
      title="Today P/L"
      action={{ label: 'Wallet', to: ROUTES.WALLET }}
      footer="Virtual credits only — no real-money payouts."
      compact={variant === 'compact'}
    >
      <p
        className={cn(
          'font-mono text-2xl font-bold tabular-nums',
          todayPl >= 0 ? 'text-accent-win' : 'text-accent-loss',
        )}
      >
        {formatCredits(todayPl)}
      </p>
    </RewardMissionCard>
  )

  const header = (
    <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3 border-b border-border-default/50">
      <div className="flex items-center gap-1.5 min-w-0">
        <h2 className="font-semibold text-sm text-text-primary truncate">Arena rewards</h2>
        <Link
          to={ROUTES.TERMS}
          className="text-text-muted hover:text-accent-secondary transition-colors shrink-0"
          aria-label="Rewards rules"
        >
          <InformationCircleIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )

  if (variant === 'compact') {
    return (
      <section className={cn('sidebar-panel overflow-hidden', className)} aria-label="Arena rewards">
        {header}
        <div className="p-3 space-y-3">
          {rankingCard}
          {forumCard}
          {streakCard}
        </div>
      </section>
    )
  }

  return (
    <section className={cn('sidebar-panel overflow-hidden', className)} aria-label="Arena rewards">
      {header}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="grid gap-3 lg:grid-cols-2">
          {rankingCard}
          {forumCard}
          {todayCard}
        </div>
        {streakCard}
        <p className="text-[11px] text-text-muted leading-relaxed pt-1">
          <Link to={ROUTES.TERMS} className="text-accent-secondary hover:underline font-medium">
            Read the game rules
          </Link>
          {' '}for ranking prizes, forum bonuses, and streak rewards.
        </p>
      </div>
    </section>
  )
}

function RewardMissionCard({
  title,
  action,
  footer,
  compact,
  children,
}: {
  title: string
  action: { label: string; to: string }
  footer: string
  compact?: boolean
  children: ReactNode
}) {
  return (
    <article
      className={cn(
        'rounded-xl border border-border-default/50 bg-bg-elevated/60',
        compact ? 'p-3.5' : 'p-4',
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <Link
          to={action.to}
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-accent-secondary hover:text-accent-primary transition-colors shrink-0 group"
        >
          {action.label}
          <ChevronRightIcon className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      {children}
      <p className="mt-3 text-[11px] text-text-muted leading-relaxed border-t border-border-default/40 pt-3">
        {footer}
      </p>
    </article>
  )
}
