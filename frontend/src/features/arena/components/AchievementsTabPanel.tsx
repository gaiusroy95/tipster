import { useAuthStore } from '@/features/auth/stores/authStore'
import { usePlayerProfile } from '@/features/profile/hooks/useProfile'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { formatDateTime } from '@/shared/utils/formatDate'

export function AchievementsTabPanel() {
  const user = useAuthStore((s) => s.user)
  const profile = usePlayerProfile(user?.id ?? '')

  if (!user) return null

  if (profile.isError) return <QueryErrorFallback onRetry={() => profile.refetch()} />

  if (profile.isLoading) {
    return <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
  }

  const achievements = profile.data?.achievements ?? []

  return (
    <div>
      <h2 className="font-display text-lg font-bold mb-2">Your achievements</h2>
      <p className="text-sm text-text-muted mb-6">
        Milestones earned during the season. View your full stats on your public profile.
      </p>
      {achievements.length === 0 ? (
        <p className="text-text-muted text-sm">Place bets to unlock achievements.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {achievements.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-accent-gold/30 bg-gradient-to-br from-accent-gold/10 to-transparent p-5"
            >
              <p className="font-display font-bold text-accent-gold">{a.name}</p>
              <p className="text-sm text-text-muted mt-1">{a.description}</p>
              <p className="text-xs text-text-muted mt-3">{formatDateTime(a.earnedAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
