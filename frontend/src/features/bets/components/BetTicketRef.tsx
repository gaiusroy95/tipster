import { formatDateTime } from '@/shared/utils/formatDate'
import { cn } from '@/shared/utils/cn'

interface BetTicketRefProps {
  ticketReference: string
  placedAt: string
  className?: string
  compact?: boolean
}

export function BetTicketRef({ ticketReference, placedAt, className, compact }: BetTicketRefProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-text-muted',
        className,
      )}
    >
      <span className="font-mono font-semibold text-accent-secondary/90">{ticketReference}</span>
      {!compact && (
        <>
          <span className="text-text-muted/40" aria-hidden="true">
            ·
          </span>
          <time dateTime={placedAt}>{formatDateTime(placedAt)}</time>
        </>
      )}
    </div>
  )
}
