import { Link } from 'react-router-dom'
import { PageShell } from '@/shared/layouts/PageShell'
import { Badge } from '@/shared/components/ui/Badge'
import { SkeletonCard } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { useSeasons } from '@/features/seasons/hooks/useSeasons'
import { seasonPath } from '@/core/constants/routes'
import { formatDateTime } from '@/shared/utils/formatDate'

export function SeasonsPage() {
  const { data, isLoading, isError, refetch } = useSeasons()

  if (isLoading) {
    return (
      <PageShell title="Seasons">
        <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      </PageShell>
    )
  }

  if (isError) {
    return (
      <PageShell title="Seasons">
        <QueryErrorFallback onRetry={() => refetch()} />
      </PageShell>
    )
  }

  return (
    <PageShell title="Seasons" description="Competition seasons and prizes">
      <div className="space-y-4">
        {data?.map((season) => (
          <Link
            key={season.id}
            to={seasonPath(season.id)}
            className="block rounded-xl border border-border-default bg-bg-surface p-6 hover:bg-bg-elevated transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold">{season.name}</h2>
              {season.isActive && <Badge variant="live">Active</Badge>}
            </div>
            <p className="text-sm text-text-muted">{season.description}</p>
            <p className="text-xs text-text-muted mt-3">
              {formatDateTime(season.startDate)} — {formatDateTime(season.endDate)}
            </p>
            <p className="text-sm mt-2 text-accent-gold">{season.prizes.length} prize tiers</p>
          </Link>
        ))}
      </div>
    </PageShell>
  )
}
