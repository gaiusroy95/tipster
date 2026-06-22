import { Bars3Icon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useLeagues } from '@/features/fixtures/hooks/useFixtures'
import { useFixtureNavParams } from '@/features/fixtures/hooks/useFixtureNavParams'
import { useSportsNavDrawer } from '@/features/fixtures/context/SportsNavDrawerContext'
import { SPORT_CATEGORIES } from '@/core/constants/sports'
import { cn } from '@/shared/utils/cn'

const VIEW_LABELS: Record<string, string> = {
  live: 'Live',
  upcoming: 'Upcoming',
  finished: 'Finished',
}

export function MobileSportsNavTrigger({ className }: { className?: string }) {
  const { open } = useSportsNavDrawer()
  const { view, sportId, leagueId } = useFixtureNavParams()
  const leagues = useLeagues(sportId)

  const sportName = SPORT_CATEGORIES.find((s) => s.id === sportId)?.name ?? 'Soccer'
  const leagueName = leagueId
    ? leagues.data?.find((l) => l.id === leagueId)?.name
    : undefined

  const summary = [VIEW_LABELS[view] ?? view, sportName, leagueName].filter(Boolean).join(' · ')

  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        'xl:hidden flex w-full items-center gap-3 rounded-lg border border-border-default bg-bg-surface px-3 py-2.5 min-h-[44px] text-left transition-colors hover:bg-bg-elevated/60',
        className,
      )}
      aria-label="Open sports navigation"
    >
      <Bars3Icon className="h-5 w-5 shrink-0 text-text-muted" aria-hidden="true" />
      <span className="flex-1 min-w-0 truncate text-sm text-text-primary">{summary}</span>
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
    </button>
  )
}
