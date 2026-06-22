import { Badge } from '@/shared/components/ui/Badge'
import type { MatchStatus } from '@/core/constants/markets'

const statusConfig: Record<MatchStatus, { label: string; variant: 'live' | 'muted' | 'default' | 'win' }> = {
  live: { label: 'LIVE', variant: 'live' },
  scheduled: { label: 'Upcoming', variant: 'muted' },
  finished: { label: 'Finished', variant: 'default' },
  postponed: { label: 'Postponed', variant: 'muted' },
}

export function LiveBadge({ status, minute }: { status: MatchStatus; minute?: number }) {
  const config = statusConfig[status]
  return (
    <Badge variant={config.variant}>
      {status === 'live' && minute ? `${minute}'` : config.label}
    </Badge>
  )
}
