import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PageShell } from '@/shared/layouts/PageShell'
import { LiveBadge } from '@/shared/components/LiveBadge'
import { OddsCell } from '@/shared/components/OddsCell'
import { Tabs, TabPanel } from '@/shared/components/ui/Tabs'
import { Button } from '@/shared/components/ui/Button'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { useMatch } from '@/features/fixtures/hooks/useFixtures'
import { useBetSlipStore } from '@/features/betting/stores/betSlipStore'
import { useToast } from '@/shared/components/ui/Toast'
import { ROUTES } from '@/core/constants/routes'
import type { MarketType } from '@/core/constants/markets'
import { formatMatchDate, formatMatchTime } from '@/shared/utils/formatDate'
import { formatSelectionLabel } from '@/shared/utils/formatOdds'

const marketTabs = [
  { id: 'winner', label: 'Winner', shortLabel: 'Win' },
  { id: 'malay', label: 'Malay', shortLabel: 'Malay' },
  { id: 'handicap', label: 'Handicap', shortLabel: 'HCP' },
  { id: 'over_under', label: 'Over/Under', shortLabel: 'O/U' },
]

export function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const { data: match, isLoading, isError, refetch } = useMatch(matchId ?? '')
  const [activeMarket, setActiveMarket] = useState('winner')
  const addSelection = useBetSlipStore((s) => s.addSelection)
  const selections = useBetSlipStore((s) => s.selections)
  const { toast } = useToast()

  if (isLoading) {
    return (
      <PageShell title="Match">
        <Skeleton className="h-48 w-full" />
      </PageShell>
    )
  }

  if (isError || !match) {
    return (
      <PageShell title="Match">
        <QueryErrorFallback onRetry={() => refetch()} />
      </PageShell>
    )
  }

  const market = match.markets.find((m) => m.marketType === activeMarket)
  const canBet = match.status === 'scheduled' || match.status === 'live'

  const handleSelect = (selectionId: string, label: string, value: number) => {
    if (!canBet) {
      toast('Cannot bet on this match', 'error')
      return
    }
    addSelection({
      matchId: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      marketType: activeMarket as MarketType,
      selectionId,
      selectionLabel: label,
      odds: value,
    })
    toast('Added to bet slip', 'success')
  }

  const score =
    match.status === 'live' || match.status === 'finished'
      ? `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`
      : null

  return (
    <PageShell title={`${match.homeTeam.name} vs ${match.awayTeam.name}`}>
      <div className="rounded-xl border border-border-default bg-bg-surface p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-text-muted">{match.league.name}</span>
          <LiveBadge status={match.status} minute={match.minute} />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <p className="text-lg font-bold">{match.homeTeam.name}</p>
            <p className="text-xs text-text-muted mt-1">{match.homeTeam.shortName}</p>
          </div>
          <div className="text-center px-4">
            {score ? (
              <p className="text-3xl font-mono font-bold">{score}</p>
            ) : (
              <div>
                <p className="text-sm text-text-muted">{formatMatchDate(match.startTime)}</p>
                <p className="text-xl font-mono font-bold">{formatMatchTime(match.startTime)}</p>
              </div>
            )}
          </div>
          <div className="text-center flex-1">
            <p className="text-lg font-bold">{match.awayTeam.name}</p>
            <p className="text-xs text-text-muted mt-1">{match.awayTeam.shortName}</p>
          </div>
        </div>
      </div>

      {canBet && market && (
        <div className="mt-6">
          <Tabs tabs={marketTabs} activeTab={activeMarket} onChange={setActiveMarket} scrollable />
          <TabPanel active={true}>
            <div className="mt-4 flex flex-wrap gap-3">
              {market.selections.map((sel) => {
                const selected = selections.some(
                  (s) => s.matchId === match.id && s.selectionId === sel.id,
                )
                const displayLabel = formatSelectionLabel(
                  activeMarket as MarketType,
                  sel.label,
                  sel.handicap,
                  sel.line,
                )
                return (
                  <OddsCell
                    key={sel.id}
                    label={displayLabel}
                    value={sel.value}
                    marketType={activeMarket as MarketType}
                    selected={selected}
                    variant="table"
                    onClick={() => handleSelect(sel.id, sel.label, sel.value)}
                    className="min-w-[200px]"
                  />
                )
              })}
            </div>
          </TabPanel>
        </div>
      )}

      {!canBet && (
        <p className="mt-6 text-text-muted text-sm">Betting is closed for this match.</p>
      )}

      <div className="mt-6">
        <Link to={ROUTES.BET_SLIP}>
          <Button className="w-full sm:w-auto">View bet slip</Button>
        </Link>
      </div>
    </PageShell>
  )
}
