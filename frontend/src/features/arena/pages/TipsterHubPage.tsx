import { lazy, Suspense } from 'react'
import { ArenaMasthead } from '@/features/arena/components/ArenaMasthead'
import { ArenaTabBar, useArenaTab } from '@/features/arena/components/ArenaTabBar'
import { ArenaMobileHubWidgets } from '@/features/arena/components/ArenaMobileHubWidgets'
import { CupTabPanel } from '@/features/arena/components/CupTabPanel'
import { SportsCategorySlider } from '@/features/fixtures/components/SportsCategorySlider'
import { useArenaPrefetch } from '@/features/arena/hooks/useArenaPrefetch'
import { Skeleton } from '@/shared/components/ui/Skeleton'

const LeaderboardTabPanel = lazy(() =>
  import('@/features/arena/components/LeaderboardTabPanel').then((m) => ({
    default: m.LeaderboardTabPanel,
  })),
)
const RewardsTabPanel = lazy(() =>
  import('@/features/arena/components/RewardsTabPanel').then((m) => ({
    default: m.RewardsTabPanel,
  })),
)
const AchievementsTabPanel = lazy(() =>
  import('@/features/arena/components/AchievementsTabPanel').then((m) => ({
    default: m.AchievementsTabPanel,
  })),
)
const ResultsTabPanel = lazy(() =>
  import('@/features/arena/components/ResultsTabPanel').then((m) => ({
    default: m.ResultsTabPanel,
  })),
)

function TabPanelFallback() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  )
}

export function TipsterHubPage() {
  const tab = useArenaTab()
  useArenaPrefetch()

  return (
    <div className="min-w-0 max-w-full flex flex-col gap-5 max-xl:pb-layout-nav">
      <ArenaMasthead className="max-xl:mb-0" />

      <ArenaMobileHubWidgets />

      {/* Cup / board / rewards tabs and match lists — desktop only; mobile uses Matches nav */}
      <div className="hidden xl:block">
        <ArenaTabBar />

        {tab === 'cup' && (
          <div className="flex flex-col">
            <SportsCategorySlider />
            <CupTabPanel />
          </div>
        )}

        {tab !== 'cup' && (
          <div>
            {tab === 'leaderboard' && (
              <Suspense fallback={<TabPanelFallback />}>
                <LeaderboardTabPanel />
              </Suspense>
            )}
            {tab === 'rewards' && (
              <Suspense fallback={<TabPanelFallback />}>
                <RewardsTabPanel />
              </Suspense>
            )}
            {tab === 'achievements' && (
              <Suspense fallback={<TabPanelFallback />}>
                <AchievementsTabPanel />
              </Suspense>
            )}
            {tab === 'results' && (
              <Suspense fallback={<TabPanelFallback />}>
                <ResultsTabPanel />
              </Suspense>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
