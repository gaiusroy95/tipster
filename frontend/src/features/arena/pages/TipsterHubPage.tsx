import { ArenaMasthead } from '@/features/arena/components/ArenaMasthead'
import { ArenaTabBar, useArenaTab } from '@/features/arena/components/ArenaTabBar'
import { ArenaMobileHubWidgets } from '@/features/arena/components/ArenaMobileHubWidgets'
import { CupTabPanel } from '@/features/arena/components/CupTabPanel'
import { SportsCategorySlider } from '@/features/fixtures/components/SportsCategorySlider'
import { LeaderboardTabPanel } from '@/features/arena/components/LeaderboardTabPanel'
import { RewardsTabPanel } from '@/features/arena/components/RewardsTabPanel'
import { AchievementsTabPanel } from '@/features/arena/components/AchievementsTabPanel'
import { ResultsTabPanel } from '@/features/arena/components/ResultsTabPanel'

export function TipsterHubPage() {
  const tab = useArenaTab()

  return (
    <div className="min-w-0 max-w-full">
      <ArenaMasthead />

      <ArenaMobileHubWidgets />

      <ArenaTabBar />

      {tab === 'cup' && <SportsCategorySlider />}

      <div>
        {tab === 'cup' && <CupTabPanel />}
        {tab === 'leaderboard' && <LeaderboardTabPanel />}
        {tab === 'rewards' && <RewardsTabPanel />}
        {tab === 'achievements' && <AchievementsTabPanel />}
        {tab === 'results' && <ResultsTabPanel />}
      </div>
    </div>
  )
}
