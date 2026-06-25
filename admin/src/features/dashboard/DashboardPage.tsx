import { useQuery } from '@tanstack/react-query'
import { adminClient } from '@/core/api/client'
import { queryKeys } from '@/core/constants/queryKeys'
import type { ApiResponse } from '@/core/types/api'
import { Card, PageHeader, Skeleton } from '@/shared/components/ui/Card'

interface DashboardStats {
  userCount: number
  activeBets: number
  forumPosts: number
  enabledLeagues: number
  activeSeason: { id: string; name: string } | null
  recentAudit: Array<{
    id: string
    action: string
    entityType: string
    createdAt: string
    admin: { displayName: string; email: string }
  }>
}

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: async () => {
      const res = await adminClient.get<ApiResponse<DashboardStats>>('/stats')
      return res.data.data
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return <p className="text-accent-loss">Failed to load dashboard.</p>
  }

  const kpis = [
    { label: 'Users', value: data.userCount },
    { label: 'Active bets', value: data.activeBets },
    { label: 'Forum posts', value: data.forumPosts },
    { label: 'Enabled leagues', value: data.enabledLeagues },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={
          data.activeSeason
            ? `Active season: ${data.activeSeason.name}`
            : 'No active season'
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-4 sm:p-5">
            <p className="text-xs uppercase tracking-wider text-text-muted">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums font-display">{kpi.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4 sm:p-5">
        <h2 className="font-display font-semibold mb-3">Recent audit activity</h2>
        {data.recentAudit.length === 0 ? (
          <p className="text-sm text-text-muted">No audit entries yet.</p>
        ) : (
          <ul className="divide-y divide-border-default text-sm">
            {data.recentAudit.map((entry) => (
              <li key={entry.id} className="py-2 flex justify-between gap-4">
                <span>
                  <span className="font-medium">{entry.action}</span>
                  <span className="text-text-muted"> · {entry.entityType}</span>
                </span>
                <span className="text-text-muted shrink-0">
                  {new Date(entry.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
