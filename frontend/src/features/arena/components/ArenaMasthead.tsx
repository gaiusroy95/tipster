import { useActiveSeason } from '@/features/seasons/hooks/useSeasons'
import { ActiveSeasonHero } from '@/features/arena/components/ActiveSeasonHero'
import { SportsNewsSection } from '@/features/news/components/SportsNewsSection'

export function ArenaMasthead() {
  const activeSeason = useActiveSeason()

  return (
    <section
      className="mb-5 rounded-lg border border-border-default bg-bg-surface"
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
