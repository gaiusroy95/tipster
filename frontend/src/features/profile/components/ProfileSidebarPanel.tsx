import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { ROUTES, playerPath } from '@/core/constants/routes'
import {
  PROFILE_ICON_MONEY_BAG,
} from '@/core/constants/branding'
import { OpenBetsIcon } from '@/features/profile/components/OpenBetsIcon'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { useBets } from '@/features/bets/hooks/useBets'
import { ProfileRewardsWidget } from '@/features/profile/components/ProfileRewardsWidget'
import { ProfileSocialStatsGrid } from '@/features/profile/components/ProfileSocialStats'
import { ProfileAvatar } from '@/features/profile/components/ProfileAvatar'
import { ProfileBalanceIcon } from '@/features/profile/components/ProfileBalanceIcon'
import { prefetchPlayerProfile } from '@/features/profile/hooks/useProfile'
import { rankTier } from '@/features/profile/lib/profileUtils'
import { CollapsibleSection } from '@/shared/components/CollapsibleSection'
import { formatCredits } from '@/shared/utils/formatCredits'
import { cn } from '@/shared/utils/cn'
import type { UserProfileStats } from '@/mocks/data/types'

function GuestSidebarCard() {
  return (
    <div className="sidebar-panel p-5 space-y-3">
      <p className="text-sm font-semibold text-text-primary">Your arena profile</p>
      <p className="text-xs text-text-muted leading-relaxed">
        Sign in to track balance, open bets, rewards, and rankings.
      </p>
      <Link
        to={ROUTES.LOGIN}
        className="inline-flex text-sm font-semibold text-accent-secondary hover:underline"
      >
        Sign in →
      </Link>
    </div>
  )
}

function ProfileSidebarContent({
  user,
  profileStats,
  dashboard,
  tier,
  openStake,
  activeCount,
  prefetchProfile,
}: {
  user: NonNullable<ReturnType<typeof useAuthStore.getState>['user']>
  profileStats: UserProfileStats
  dashboard: ReturnType<typeof useDashboard>['data']
  tier: ReturnType<typeof rankTier>
  openStake: number
  activeCount: number
  prefetchProfile: () => void
}) {
  return (
    <div className="space-y-3">
      <ProfileRewardsWidget
        profile={profileStats}
        dashboard={dashboard}
        variant="compact"
      />

      <section className="sidebar-panel overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-border-default/60 flex items-center justify-between gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">My profile</h2>
          <Link
            to={playerPath(user.id)}
            onMouseEnter={prefetchProfile}
            onFocus={prefetchProfile}
            className="text-xs font-semibold text-accent-secondary hover:underline"
          >
            View profile
          </Link>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <ProfileAvatar
              name={user.displayName}
              avatarUrl={user.avatarUrl}
              className="h-12 w-12 text-sm ring-2 ring-border-default/80"
            />
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{user.displayName}</p>
              <p className="text-xs text-text-muted truncate">@{user.username}</p>
              <span
                className={cn(
                  'inline-flex mt-1.5 items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                  tier.className,
                )}
              >
                {tier.label}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <SidebarBalanceRow
              to={ROUTES.WALLET}
              iconSrc={PROFILE_ICON_MONEY_BAG}
              label="Arena balance"
              value={formatCredits(user.balance)}
              valueClass="text-accent-gold"
            />
            <SidebarBalanceRow
              to={ROUTES.BETS_ACTIVE}
              icon={<OpenBetsIcon size="sm" />}
              label="Open bets"
              value={formatCredits(openStake)}
              suffix={`(${activeCount})`}
            />
          </div>

          <ProfileSocialStatsGrid className="border-t border-border-default/60 pt-3" />
        </div>
      </section>

      <div className="space-y-2">
        <CollapsibleSection title="My achievements">
          <Link
            to={`${playerPath(user.id)}?tab=achievements`}
            className="text-accent-secondary font-semibold hover:underline text-sm"
          >
            View achievements →
          </Link>
        </CollapsibleSection>
        <CollapsibleSection title="Balance history">
          <Link to={ROUTES.WALLET} className="text-accent-secondary font-semibold hover:underline text-sm">
            Open wallet →
          </Link>
        </CollapsibleSection>
        <CollapsibleSection title="My ranking">
          <Link to={ROUTES.LEADERBOARD} className="text-accent-secondary font-semibold hover:underline text-sm">
            Full leaderboard →
          </Link>
          <p className="mt-2 text-xs text-text-muted">Current rank #{user.rank}</p>
        </CollapsibleSection>
        <CollapsibleSection title="Active bets">
          <Link to={ROUTES.BETS_ACTIVE} className="text-accent-secondary font-semibold hover:underline text-sm">
            Manage open bets →
          </Link>
        </CollapsibleSection>
      </div>
    </div>
  )
}

function buildProfileStats(
  user: NonNullable<ReturnType<typeof useAuthStore.getState>['user']>,
  activeCount: number,
  dashboard: ReturnType<typeof useDashboard>['data'],
) {
  return {
    userId: user.id,
    displayName: user.displayName,
    username: user.username,
    avatarUrl: user.avatarUrl,
    rank: user.rank,
    balance: user.balance,
    seasonStats: {
      points: 0,
      roi: 0,
      profitLoss: 0,
      winRate: 0,
      totalBets: 0,
      wins: 0,
      losses: 0,
      activeBets: activeCount,
    },
    bettingStats: {
      avgStake: 0,
      biggestWin: 0,
      biggestLoss: 0,
      favoriteMarket: 'malay' as const,
    },
    form: dashboard?.form ?? [],
    leaguePerformance: [],
    performanceHistory: [],
    achievements: [],
    achievementProgress: [],
  }
}

export function ProfileSidebarPanel() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const location = useLocation()
  const dashboard = useDashboard()
  const activeBets = useBets('active')
  const hideMobilePanel = location.pathname === ROUTES.FIXTURES

  useEffect(() => {
    if (user?.id) {
      prefetchPlayerProfile(queryClient, user.id)
    }
  }, [queryClient, user?.id])

  const prefetchProfile = () => {
    if (user?.id) prefetchPlayerProfile(queryClient, user.id)
  }

  if (!user) {
    return (
      <>
        <aside className="hidden lg:block w-[300px] shrink-0" aria-label="Profile sidebar">
          <div className="sticky top-[calc(4rem+1rem)]">
            <GuestSidebarCard />
          </div>
        </aside>
        <section
          className={cn(
            'lg:hidden w-full shrink-0 pb-layout-nav',
            hideMobilePanel && 'max-lg:hidden',
          )}
          aria-label="Profile sidebar"
        >
          <GuestSidebarCard />
        </section>
      </>
    )
  }

  const tier = rankTier(user.rank)
  const openStake = activeBets.data?.reduce((sum, bet) => sum + bet.stake, 0) ?? 0
  const activeCount = dashboard.data?.activeBetsCount ?? activeBets.data?.length ?? 0
  const profileStats = buildProfileStats(user, activeCount, dashboard.data)

  const contentProps = {
    user,
    profileStats,
    dashboard: dashboard.data,
    tier,
    openStake,
    activeCount,
    prefetchProfile,
  }

  return (
    <>
      <aside className="hidden lg:block w-[300px] shrink-0" aria-label="Profile sidebar">
        <div className="sticky top-[calc(4rem+1rem)]">
          <ProfileSidebarContent {...contentProps} />
        </div>
      </aside>

      <section
        className={cn(
          'lg:hidden w-full shrink-0 pb-layout-nav',
          hideMobilePanel && 'max-lg:hidden',
        )}
        aria-label="Profile sidebar"
      >
        <ProfileSidebarContent {...contentProps} />
      </section>
    </>
  )
}

function SidebarBalanceRow({
  iconSrc,
  icon,
  label,
  value,
  valueClass,
  suffix,
  to,
}: {
  iconSrc?: string
  icon?: ReactNode
  label: string
  value: string
  valueClass?: string
  suffix?: string
  to?: string
}) {
  const content = (
    <>
      {icon ?? (iconSrc ? <ProfileBalanceIcon src={iconSrc} size="sm" /> : null)}
      <span className="text-sm text-text-muted flex-1">{label}</span>
      <span className={cn('font-mono font-bold tabular-nums text-sm', valueClass ?? 'text-text-primary')}>
        {value}
        {suffix && <span className="text-text-muted font-normal text-xs ml-1">{suffix}</span>}
      </span>
      {to && <ChevronRightIcon className="h-4 w-4 text-text-muted shrink-0" aria-hidden="true" />}
    </>
  )

  const className =
    'flex items-center gap-2.5 rounded-xl border border-border-default/60 bg-bg-elevated/40 px-3 py-2.5 hover:bg-bg-elevated/70 transition-colors'

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}
