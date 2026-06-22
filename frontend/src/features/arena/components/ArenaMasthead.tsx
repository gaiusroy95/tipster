import { useSeasons } from '@/features/seasons/hooks/useSeasons'
import { ActiveSeasonHero } from '@/features/arena/components/ActiveSeasonHero'
import { SportsNewsSection } from '@/features/news/components/SportsNewsSection'

export function ArenaMasthead() {
  const seasons = useSeasons()
  const activeSeason = seasons.data?.find((s) => s.isActive)

  return (
    <section
      className="mb-5 rounded-lg border border-border-default bg-bg-surface"
      aria-label="Tipster Arena"
    >
      <ActiveSeasonHero
        variant="embedded"
        season={activeSeason}
        isLoading={seasons.isLoading}
      />

      <div className="border-t border-border-default">
        <SportsNewsSection variant="embedded" />
      </div>
    </section>
  )
}
