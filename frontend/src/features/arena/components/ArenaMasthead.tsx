import { useActiveSeason } from '@/features/seasons/hooks/useSeasons'
import { ActiveSeasonHero } from '@/features/arena/components/ActiveSeasonHero'
import { SportsNewsSection } from '@/features/news/components/SportsNewsSection'
import { cn } from '@/shared/utils/cn'

export function ArenaMasthead({ className }: { className?: string }) {
  const activeSeason = useActiveSeason()

  return (
    <section
      className={cn('mb-5 rounded-lg border border-border-default bg-bg-surface', className)}
      aria-label="Tipster Arena"
    >
      <ActiveSeasonHero
        variant="embedded"
        season={activeSeason.data ?? undefined}
        isLoading={activeSeason.isPending && !activeSeason.data}
      />

      <div className="border-t border-border-default">
        <SportsNewsSection variant="embedded" />
      </div>
    </section>
  )
}
