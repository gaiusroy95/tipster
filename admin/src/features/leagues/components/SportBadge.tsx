import { formatSportLabel, getSportAccentClass } from '@/features/leagues/lib/leagueUtils'
import { cn } from '@/shared/utils/cn'

export function SportBadge({
  sportId,
  className,
}: {
  sportId: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        getSportAccentClass(sportId),
        className,
      )}
    >
      {formatSportLabel(sportId)}
    </span>
  )
}
