import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
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
import { ProfileAvatar } from '@/features/profile/components/ProfileAvatar'
import { ProfileBalanceIcon } from '@/features/profile/components/ProfileBalanceIcon'
import { rankTier } from '@/features/profile/lib/profileUtils'
import { CollapsibleSection } from '@/shared/components/CollapsibleSection'
import { formatCredits } from '@/shared/utils/formatCredits'
import { cn } from '@/shared/utils/cn'

export function ProfileSidebarPanel() {
  const user = useAuthStore((s) => s.user)
  const dashboard = useDashboard()
  const activeBets = useBets('active')

  if (!user) {
    return (
      <aside className="hidden lg:block w-[300px] shrink-0">
        <div className="sidebar-panel p-5 space-y-3 sticky top-[calc(4rem+1rem)]">
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
      </aside>
    )
  }

  const tier = rankTier(user.rank)
  const openStake = activeBets.data?.reduce((sum, bet) => sum + bet.stake, 0) ?? 0
  const activeCount = dashboard.data?.activeBetsCount ?? activeBets.data?.length ?? 0

  const profileStats = {
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
    form: dashboard.data?.form ?? [],
    leaguePerformance: [],
    performanceHistory: [],
    achievements: [],
  }

  return (
    <aside className="hidden lg:block w-[300px] shrink-0" aria-label="Profile sidebar">
      <div className="sticky top-[calc(4rem+1rem)] space-y-3">
        <ProfileRewardsWidget
          profile={profileStats}
          dashboard={dashboard.data}
          variant="compact"
        />

        <section className="sidebar-panel overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-border-default/60 flex items-center justify-between gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">My profile</h2>
            <Link
              to={playerPath(user.id)}
              className="text-xs font-semibold text-accent-secondary hover:underline"
            >
              View profile
            </Link>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <ProfileAvatar name={user.displayName} avatarUrl={user.avatarUrl} className="h-12 w-12 text-sm ring-2 ring-border-default/80" />
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

            <div className="grid grid-cols-4 gap-1 text-center border-t border-border-default/60 pt-3">
              {['Posts', 'Followers', 'Following', 'Views'].map((label) => (
                <div key={label} className="py-1">
                  <p className="font-mono font-bold text-text-primary text-sm">0</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{label}</p>
                </div>
              ))}
            </div>
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
    </aside>
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

  const className = 'flex items-center gap-2.5 rounded-xl border border-border-default/60 bg-bg-elevated/40 px-3 py-2.5 hover:bg-bg-elevated/70 transition-colors'

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}
