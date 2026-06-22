import { LockClosedIcon } from '@heroicons/react/24/outline'
import { AchievementsGrid } from '@/features/achievements/components/AchievementBadge'
import { LEAGUE_MEDALS } from '@/features/profile/lib/profileUtils'
import { cn } from '@/shared/utils/cn'
import type { UserProfileStats } from '@/mocks/data/types'

export function ProfileMedalsGrid({ profile }: { profile: UserProfileStats }) {
  const earnedNames = new Set(
    profile.achievements.map((a) => a.name.toLowerCase()),
  )
  const leagueUnlocked = new Set(
    profile.leaguePerformance.filter((l) => l.profitLoss > 0).map((l) => l.leagueName.toLowerCase()),
  )

  return (
    <section className="sidebar-panel p-4 sm:p-5">
      <h2 className="font-display text-base font-bold mb-1">League medals</h2>
      <p className="text-xs text-text-muted mb-4">Earn medals by profiting in each competition</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {LEAGUE_MEDALS.map((medal) => {
          const unlocked =
            leagueUnlocked.has(medal.name.toLowerCase()) ||
            earnedNames.has(medal.name.toLowerCase()) ||
            profile.seasonStats.wins > 2

          return (
            <div
              key={medal.id}
              className={cn(
                'flex flex-col items-center rounded-xl border p-4 text-center transition-colors',
                unlocked
                  ? 'border-accent-gold/40 bg-gradient-to-b from-accent-gold/15 to-transparent'
                  : 'border-border-default/80 bg-bg-elevated/30 opacity-80',
              )}
            >
              <div
                className={cn(
                  'relative flex h-14 w-14 items-center justify-center rounded-full text-xs font-bold mb-2',
                  unlocked
                    ? 'bg-gradient-to-br from-accent-gold to-amber-600 text-bg-primary shadow-glow-accent/30'
                    : 'bg-bg-elevated text-text-muted border border-border-default',
                )}
              >
                {medal.short}
                {!unlocked && (
                  <LockClosedIcon
                    className="absolute -bottom-0.5 -right-0.5 h-4 w-4 text-text-muted bg-bg-surface rounded-full p-0.5"
                    aria-hidden="true"
                  />
                )}
              </div>
              <p className="text-xs font-semibold leading-tight">{medal.name}</p>
              <p className="text-[10px] text-text-muted mt-1">
                {unlocked ? 'Unlocked' : 'Unlock this medal'}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function ProfileAchievementsList({ profile }: { profile: UserProfileStats }) {
  return (
    <AchievementsGrid
      achievements={profile.achievementProgress}
      emptyMessage="Place bets and climb the leaderboard to unlock achievements."
    />
  )
}
