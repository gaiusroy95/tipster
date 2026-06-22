import { useParams } from 'react-router-dom'
import { PageShell } from '@/shared/layouts/PageShell'
import { Badge } from '@/shared/components/ui/Badge'
import { SkeletonCard } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { useSeason } from '@/features/seasons/hooks/useSeasons'
import { formatDateTime } from '@/shared/utils/formatDate'

export function SeasonDetailPage() {
  const { seasonId } = useParams<{ seasonId: string }>()
  const { data, isLoading, isError, refetch } = useSeason(seasonId ?? '')

  if (isLoading) {
    return (
      <PageShell title="Season">
        <SkeletonCard />
      </PageShell>
    )
  }

  if (isError || !data) {
    return (
      <PageShell title="Season">
        <QueryErrorFallback onRetry={() => refetch()} />
      </PageShell>
    )
  }

  return (
    <PageShell title={data.name}>
      <div className="rounded-xl border border-border-default bg-bg-surface p-6 mb-8">
        <div className="flex items-center gap-2 mb-2">
          {data.isActive && <Badge variant="live">Active season</Badge>}
        </div>
        <p className="text-text-muted">{data.description}</p>
        <p className="text-sm text-text-muted mt-4">
          {formatDateTime(data.startDate)} — {formatDateTime(data.endDate)}
        </p>
      </div>

      <h2 className="text-lg font-semibold mb-4">Prize tiers</h2>
      <div className="space-y-4">
        {data.prizes.map((prize, i) => (
          <div
            key={i}
            className="rounded-xl border border-accent-gold/20 bg-accent-gold/5 p-5"
          >
            <div className="flex items-center justify-between">
              <Badge variant="gold">
                Rank {prize.rankFrom}{prize.rankTo > prize.rankFrom ? `–${prize.rankTo}` : ''}
              </Badge>
            </div>
            <h3 className="text-lg font-bold mt-3">{prize.name}</h3>
            <p className="text-sm text-text-muted mt-1">{prize.description}</p>
          </div>
        ))}
      </div>
    </PageShell>
  )
}
