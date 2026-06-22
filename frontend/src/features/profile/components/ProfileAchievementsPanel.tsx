import { ProfilePanelCard } from '@/features/profile/components/ProfilePanelCard'
import { formatDateTime } from '@/shared/utils/formatDate'
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
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent-gold/25 to-accent-primary/15 border border-accent-gold/30 mb-4">
            <span className="font-display text-lg font-bold text-accent-gold">AB</span>
          </div>
          <p className="text-sm text-text-muted max-w-xs leading-relaxed">
            Achievements unlock as this tipster climbs the leaderboard and completes season goals.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 flex-1">
          {achievements.map((a) => (
            <div
              key={a.id}
              className="flex gap-3 rounded-xl border border-accent-gold/25 bg-gradient-to-br from-accent-gold/10 via-bg-elevated/20 to-transparent p-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-gold to-amber-600 text-bg-primary font-display font-bold text-sm shadow-sm">
                AB
              </div>
              <div className="min-w-0">
                <p className="font-display font-bold text-accent-gold leading-tight">{a.name}</p>
                <p className="text-xs text-text-muted mt-1 leading-snug">{a.description}</p>
                <p className="text-[10px] text-text-muted/80 mt-2">{formatDateTime(a.earnedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </ProfilePanelCard>
  )
}
