import { useAuthStore } from '@/features/auth/stores/authStore'
import { AchievementsGrid } from '@/features/achievements/components/AchievementBadge'
import { useAchievements } from '@/features/achievements/hooks/useAchievements'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'

export function AchievementsTabPanel() {
  const user = useAuthStore((s) => s.user)
  const achievements = useAchievements()

  if (!user) return null

  if (achievements.isError) {
    return <QueryErrorFallback onRetry={() => achievements.refetch()} />
  }

  if (achievements.isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
    )
  }

  const list = achievements.data ?? []

  return (
    <div>
      <h2 className="font-display text-lg font-bold mb-2">Your achievements</h2>
      <p className="text-sm text-text-muted mb-6">
        Milestones earned during the season. Locked badges show progress toward the next unlock.
      </p>
      <AchievementsGrid
        achievements={list}
        emptyMessage="Place bets to start unlocking achievements."
      />
    </div>
  )
}
