import { useQuery } from '@tanstack/react-query'
import { adminClient } from '@/core/api/client'
import { queryKeys } from '@/core/constants/queryKeys'
import type { ApiResponse } from '@/core/types/api'
import { AuditTimeline } from '@/features/dashboard/components/AuditTimeline'
import { DashboardHero, DashboardHeroSkeleton } from '@/features/dashboard/components/DashboardHero'
import {
  DashboardMetrics,
  DashboardMetricsSkeleton,
} from '@/features/dashboard/components/DashboardMetrics'
import { PlatformHealthStrip } from '@/features/dashboard/components/PlatformHealthStrip'
import { QuickActionsGrid } from '@/features/dashboard/components/QuickActionsGrid'
import type { DashboardStats } from '@/features/dashboard/lib/dashboardUtils'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { AdminPageShell } from '@/shared/components/AdminPageShell'
import { Skeleton } from '@/shared/components/ui/Card'

export function DashboardPage() {
  const adminName = useAuthStore((s) => s.user?.displayName ?? 'Admin')

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: async () => {
      const res = await adminClient.get<ApiResponse<DashboardStats>>('/stats')
      return res.data.data
    },
  })

  if (isLoading) {
    return (
      <AdminPageShell>
        <DashboardHeroSkeleton />
        <DashboardMetricsSkeleton />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-12">
          <Skeleton className="h-[420px] rounded-2xl xl:col-span-7" />
          <Skeleton className="h-[420px] rounded-2xl xl:col-span-5" />
        </div>
      </AdminPageShell>
    )
  }

  if (error || !data) {
    return (
      <AdminPageShell>
        <div className="rounded-3xl border border-accent-loss/30 bg-accent-loss/10 p-8 text-center">
          <p className="font-display text-lg font-semibold text-accent-loss">Unable to load dashboard</p>
          <p className="mt-2 text-sm text-text-muted">
            Refresh the page or verify your connection to the admin API.
          </p>
        </div>
      </AdminPageShell>
    )
  }

  return (
    <AdminPageShell>
      <DashboardHero adminName={adminName} stats={data} />
      <DashboardMetrics stats={data} />
      <PlatformHealthStrip stats={data} />

      <div className="grid gap-4 xl:grid-cols-12 xl:items-start">
        <div className="xl:col-span-7">
          <AuditTimeline entries={data.recentAudit} />
        </div>
        <div className="xl:col-span-5">
          <QuickActionsGrid />
        </div>
      </div>
    </AdminPageShell>
  )
}
