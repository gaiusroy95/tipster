import { ProfilePanelCard } from '@/features/profile/components/ProfilePanelCard'
import { formatDateTime } from '@/shared/utils/formatDate'
import {
  AchievementBadge,
} from '@/features/achievements/components/AchievementBadge'
import { ACHIEVEMENT_BY_ID } from '@/features/achievements/constants/achievementCatalog'
import type { UserProfileStats } from '@/mocks/data/types'

export function ProfileAchievementsPanel({ profile }: { profile: UserProfileStats }) {
  const achievements = profile.achievements

  return (
    <ProfilePanelCard
      title={`${profile.displayName}'s achievements`}
      subtitle="Milestones and arena honors"
      bodyClassName="flex flex-col"
    >
      {achievements.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
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
        <div className="grid gap-3 sm:grid-cols-2 flex-1">
          {achievements.map((a) => {
            const def = ACHIEVEMENT_BY_ID[a.id]
            return (
              <div
                key={a.id}
                className="flex gap-3 rounded-xl border border-accent-gold/25 bg-gradient-to-br from-accent-gold/10 via-bg-elevated/20 to-transparent p-4"
              >
                <AchievementBadge
                  name={a.name}
                  tier={def?.tier ?? 'standard'}
                  iconSlug={def?.iconSlug ?? a.id}
                  earned
                />
                <div className="min-w-0">
                  <p className="font-display font-bold text-accent-gold leading-tight">{a.name}</p>
                  <p className="text-xs text-text-muted mt-1 leading-snug">{a.description}</p>
                  <p className="text-[10px] text-text-muted/80 mt-2">{formatDateTime(a.earnedAt)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </ProfilePanelCard>
  )
}
