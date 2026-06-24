import { ProfilePanelCard } from '@/features/profile/components/ProfilePanelCard'
import {
  AchievementBadge,
  AchievementsGrid,
} from '@/features/achievements/components/AchievementBadge'
import { ACHIEVEMENT_BY_ID } from '@/features/achievements/constants/achievementCatalog'
import type { AchievementProgress } from '@/features/achievements/types/achievement'
import type { UserProfileStats } from '@/mocks/data/types'

function toAchievementProgress(
  profile: UserProfileStats,
): AchievementProgress[] {
  return profile.achievements.map((a) => {
    const def = ACHIEVEMENT_BY_ID[a.id]
    return {
      id: a.id,
      name: a.name,
      description: a.description,
      category: def?.category ?? 'betting',
      tier: def?.tier ?? 'standard',
      iconSlug: def?.iconSlug ?? a.id,
      earned: true,
      earnedAt: a.earnedAt,
    }
  })
}

export function ProfileAchievementsPanel({ profile }: { profile: UserProfileStats }) {
  const achievements = toAchievementProgress(profile)

  return (
    <ProfilePanelCard
      title={`${profile.displayName}'s achievements`}
      subtitle="Milestones and arena honors"
      className="min-w-0"
    >
      {achievements.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-8">
          <AchievementBadge
            name="Achievements"
            tier="standard"
            iconSlug="arena-debut"
            earned={false}
            size="lg"
            className="mb-4"
          />
          <p className="text-sm text-text-muted max-w-xs leading-relaxed">
            Achievements unlock as this tipster places bets, links accounts, and climbs the leaderboard.
          </p>
        </div>
      ) : (
        <AchievementsGrid
          achievements={achievements}
          layout="compact"
          showEarnedAt
        />
      )}
    </ProfilePanelCard>
  )
}
