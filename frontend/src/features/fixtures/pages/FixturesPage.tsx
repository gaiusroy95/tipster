import { useState } from 'react'
import { PageShell } from '@/shared/layouts/PageShell'
import { MatchRow } from '@/shared/components/MatchRow'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { EmptyState } from '@/shared/components/EmptyState'
import { useFixtures, useLeagues } from '@/features/fixtures/hooks/useFixtures'
import { LeagueLogo } from '@/shared/components/LeagueLogo'
import { cn } from '@/shared/utils/cn'

export function FixturesPage() {
  const [leagueId, setLeagueId] = useState<string | undefined>()
  const leagues = useLeagues()
  const fixtures = useFixtures({ leagueId, sportId: 'soccer', status: 'scheduled' })

  if (fixtures.isError) {
    return (
      <PageShell title="Fixtures">
        <QueryErrorFallback onRetry={() => fixtures.refetch()} />
      </PageShell>
    )
  }

  return (
    <PageShell title="Fixtures" description="Football matches — place virtual bets">
      {leagues.isLoading ? (
        <Skeleton className="h-10 w-full mb-6" />
      ) : (
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            type="button"
            onClick={() => setLeagueId(undefined)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] border transition-colors',
              !leagueId
                ? 'bg-accent-primary/15 border-accent-primary text-accent-primary'
                : 'border-border-default bg-bg-surface text-text-muted hover:text-text-primary',
            )}
          >
            All leagues
          </button>
          {leagues.data?.map((league) => (
            <button
              key={league.id}
              type="button"
              onClick={() => setLeagueId(league.id)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] border transition-colors',
                leagueId === league.id
                  ? 'bg-accent-primary/15 border-accent-primary text-accent-primary'
                  : 'border-border-default bg-bg-surface text-text-muted hover:text-text-primary',
              )}
            >
              <LeagueLogo name={league.name} country={league.country} logoUrl={league.logoUrl} size="xs" />
              {league.name}
            </button>
          ))}
        </div>
      )}

      {fixtures.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : fixtures.data?.length === 0 ? (
        <EmptyState title="No fixtures" description="No matches found for this filter." />
      ) : (
        <div className="space-y-3">
          {fixtures.data?.map((match) => <MatchRow key={match.id} match={match} />)}
        </div>
      )}
    </PageShell>
  )
}
