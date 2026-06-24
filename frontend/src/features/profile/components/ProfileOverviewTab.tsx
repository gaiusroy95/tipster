import { OverallRankPanel } from '@/features/profile/components/OverallRankPanel'
import { ProfileRewardsSection } from '@/features/profile/components/ProfileRewardsSection'
import { ProfileAllTimeStats } from '@/features/profile/components/ProfileRewardsSection'
import { ProfileBalanceHistoryPanel } from '@/features/profile/components/ProfileBalanceHistoryPanel'
import { ProfileRankingPanel } from '@/features/profile/components/ProfileRankingPanel'
import { ProfileAchievementsPanel } from '@/features/profile/components/ProfileAchievementsPanel'
import type { UserProfileStats } from '@/mocks/data/types'
import type { DashboardData } from '@/mocks/data/types'

export function ProfileOverviewTab({
  profile,
  dashboard,
  isOwnProfile,
  totalPlayers = 3088,
}: {
  profile: UserProfileStats
  dashboard?: DashboardData
  isOwnProfile: boolean
  totalPlayers?: number
}) {
  return (
    <div className="space-y-4 sm:space-y-5">
      {profile.overallRank && <OverallRankPanel stats={profile.overallRank} />}

      {isOwnProfile && (
        <ProfileRewardsSection profile={profile} dashboard={dashboard} />
      )}

      <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
        <ProfileAllTimeStats profile={profile} totalPlayers={totalPlayers} />
        <ProfileBalanceHistoryPanel profile={profile} isOwnProfile={isOwnProfile} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0 items-start">
        <ProfileRankingPanel profile={profile} />
        <ProfileAchievementsPanel profile={profile} />
      </div>
    </div>
  )
}
