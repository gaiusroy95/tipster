import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { usePlayerProfile, usePlayerBets } from '@/features/profile/hooks/useProfile'
import { useEditProfileDrawer } from '@/features/profile/context/EditProfileDrawerContext'
import { ProfileHeader } from '@/features/profile/components/ProfileHeader'
import { ProfileTabBar, useProfileTab } from '@/features/profile/components/ProfileTabBar'
import { ProfileOverviewTab } from '@/features/profile/components/ProfileOverviewTab'
import { ProfileAchievementsList } from '@/features/profile/components/ProfileMedalsGrid'
import { ProfileOpenBetsTab } from '@/features/profile/components/ProfileOpenBetsTab'
import { BetCard } from '@/shared/components/BetCard'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { Skeleton, SkeletonCard } from '@/shared/components/ui/Skeleton'
import { seasonPath } from '@/core/constants/routes'
import { useSeasons } from '@/features/seasons/hooks/useSeasons'
import { formatCredits } from '@/shared/utils/formatCredits'
import { formatDateTime } from '@/shared/utils/formatDate'

export function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const authUser = useAuthStore((s) => s.user)
  const tab = useProfileTab()
  const profile = usePlayerProfile(userId ?? '')
  const isOwnProfile = authUser?.id === userId
  const profileReady = !!profile.data

  const activeBets = usePlayerBets(userId ?? '', 'active', { enabled: profileReady })
  const historyBets = usePlayerBets(userId ?? '', 'won', {
    enabled: profileReady && tab === 'history',
  })
  const lostBets = usePlayerBets(userId ?? '', 'lost', {
    enabled: profileReady && tab === 'history',
  })
  const allBets = usePlayerBets(userId ?? '', undefined, {
    enabled: profileReady && tab === 'history',
  })
  const seasons = useSeasons({ enabled: tab === 'season' })
  const dashboard = useDashboard(isOwnProfile && tab === 'overview')
  const { open: openEditProfile } = useEditProfileDrawer()

  const openBetsTotal = useMemo(
    () => activeBets.data?.reduce((sum, b) => sum + b.stake, 0) ?? 0,
    [activeBets.data],
  )

  const combinedHistory = useMemo(() => {
    const won = historyBets.data ?? []
    const lost = lostBets.data ?? []
    return [...won, ...lost].sort(
      (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
    )
  }, [historyBets.data, lostBets.data])

  if (profile.isPending && !profile.data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (profile.isError || !profile.data) {
    return <QueryErrorFallback onRetry={() => profile.refetch()} />
  }

  const p = profile.data
  const totalPlayers = p.overallRank?.totalPlayers ?? 3088

  return (
    <div className="space-y-4 sm:space-y-5 min-w-0">
      <ProfileHeader
        profile={p}
        isOwnProfile={isOwnProfile}
        openBetsTotal={openBetsTotal}
        totalPlayers={totalPlayers}
        countryCode={isOwnProfile ? authUser?.country : undefined}
      />

      <ProfileTabBar />

      {tab === 'overview' && (
        <ProfileOverviewTab
          profile={p}
          dashboard={isOwnProfile ? dashboard.data : undefined}
          isOwnProfile={isOwnProfile}
          totalPlayers={totalPlayers}
        />
      )}

      {tab === 'open-bets' && (
        <ProfileOpenBetsTab
          bets={activeBets.data}
          loading={activeBets.isLoading}
          isOwnProfile={isOwnProfile}
          emptyTitle="No open bets"
          emptyDescription={
            isOwnProfile
              ? 'Active positions will appear here after you place a bet.'
              : 'This tipster has no open positions right now.'
          }
        />
      )}

      {tab === 'history' && (
        <ProfileBetsTab
          bets={combinedHistory.length ? combinedHistory : allBets.data?.filter((b) => b.status !== 'active')}
          loading={historyBets.isLoading || lostBets.isLoading}
          emptyTitle="No bet history"
          emptyDescription="Settled bets will show this tipster's transparency record."
          summaryLabel="Settled bets"
        />
      )}

      {tab === 'season' && (
        <section className="sidebar-panel p-4 sm:p-5 space-y-4">
          <h2 className="font-display text-base font-bold">Season history</h2>
          {seasons.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : seasons.data?.length === 0 ? (
            <EmptyState title="No seasons" description="Season archives will appear here." />
          ) : (
            <ul className="space-y-2">
              {seasons.data?.map((season) => (
                <li key={season.id}>
                  <Link
                    to={seasonPath(season.id)}
                    className="flex items-center justify-between rounded-xl border border-border-default/80 bg-bg-elevated/40 px-4 py-3 hover:border-accent-secondary/40 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm">{season.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {formatDateTime(season.startDate)} — {formatDateTime(season.endDate)}
                      </p>
                    </div>
                    {season.isActive && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-accent-win bg-accent-win/15 px-2 py-1 rounded-md">
                        Active
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'achievements' && (
        <section className="sidebar-panel p-4 sm:p-5">
          <h2 className="font-display text-base font-bold mb-4">Achievements</h2>
          <ProfileAchievementsList profile={p} />
        </section>
      )}

      {tab === 'social' && (
        <section className="sidebar-panel p-4 sm:p-5">
          <h2 className="font-display text-base font-bold mb-2">Followers & following</h2>
          <p className="text-sm text-text-muted mb-6">
            Social features are coming soon. Follow tipsters and share your picks with the arena.
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <div className="rounded-xl border border-border-default bg-bg-elevated/40 p-4 text-center">
              <p className="font-mono text-2xl font-bold">{p.socialStats.followers.toLocaleString()}</p>
              <p className="text-xs text-text-muted mt-1">Followers</p>
            </div>
            <div className="rounded-xl border border-border-default bg-bg-elevated/40 p-4 text-center">
              <p className="font-mono text-2xl font-bold">{p.socialStats.following.toLocaleString()}</p>
              <p className="text-xs text-text-muted mt-1">Following</p>
            </div>
          </div>
          {isOwnProfile && (
            <Button variant="secondary" size="sm" className="mt-6" onClick={openEditProfile}>
              Edit profile
            </Button>
          )}
        </section>
      )}
    </div>
  )
}

function ProfileBetsTab({
  bets,
  loading,
  emptyTitle,
  emptyDescription,
  summaryLabel,
}: {
  bets?: ReturnType<typeof usePlayerBets>['data']
  loading: boolean
  emptyTitle: string
  emptyDescription: string
  summaryLabel?: string
}) {
  const totalStake = bets?.reduce((sum, b) => sum + b.stake, 0) ?? 0

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (!bets?.length) {
    return (
      <div className="sidebar-panel p-6">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {summaryLabel && bets && bets.length > 0 && (
        <div className="sidebar-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{summaryLabel}</p>
            <p className="font-mono text-lg font-bold text-text-primary tabular-nums mt-0.5">
              {bets.length} bet{bets.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Total stake</p>
            <p className="font-mono text-lg font-bold text-accent-gold tabular-nums mt-0.5">
              {formatCredits(totalStake)}
            </p>
          </div>
        </div>
      )}
      {bets.map((bet) => (
        <BetCard key={bet.id} bet={bet} />
      ))}
    </div>
  )
}
