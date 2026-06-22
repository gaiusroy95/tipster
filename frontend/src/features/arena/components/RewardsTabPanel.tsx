import { Link } from 'react-router-dom'
import { useSeasons } from '@/features/seasons/hooks/useSeasons'
import { seasonPath } from '@/core/constants/routes'
import { Badge } from '@/shared/components/ui/Badge'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { formatDateTime } from '@/shared/utils/formatDate'

export function RewardsTabPanel() {
  const { data, isLoading } = useSeasons()

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
  }

  return (
    <div>
      <h2 className="font-display text-lg font-bold mb-4">Season rewards</h2>
      <p className="text-sm text-text-muted mb-6">
        Top-ranked tipsters win physical prizes managed offline. Virtual credits only — no real-money betting.
      </p>
      <div className="space-y-4">
        {data?.map((season) => (
          <Link
            key={season.id}
            to={seasonPath(season.id)}
            className="block glass-panel rounded-2xl p-5 hover:border-accent-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-display font-bold text-lg">{season.name}</h3>
              {season.isActive && <Badge variant="live">Active</Badge>}
            </div>
            <p className="text-sm text-text-muted">{season.description}</p>
            <p className="text-xs text-text-muted mt-3">
              {formatDateTime(season.startDate)} — {formatDateTime(season.endDate)}
            </p>
            <p className="text-sm text-accent-gold mt-2 font-semibold">{season.prizes.length} prize tiers</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
