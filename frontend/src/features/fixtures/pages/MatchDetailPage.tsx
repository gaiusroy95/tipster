import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { Button } from '@/shared/components/ui/Button'
import { MatchDetailHero } from '@/features/fixtures/components/MatchDetailHero'
import {
  getAvailableMarketTabs,
  MatchDetailMarkets,
} from '@/features/fixtures/components/MatchDetailMarkets'
import { useMatch } from '@/features/fixtures/hooks/useFixtures'
import { useBetSlipStore } from '@/features/betting/stores/betSlipStore'
import { useToast } from '@/shared/components/ui/Toast'
import { ROUTES } from '@/core/constants/routes'
import type { MarketType } from '@/core/constants/markets'

function MatchDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-52 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )
}

export function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const { data: match, isLoading, isError, refetch } = useMatch(matchId ?? '')
  const [activeMarket, setActiveMarket] = useState<MarketType>('winner')
  const addSelection = useBetSlipStore((s) => s.addSelection)
  const selections = useBetSlipStore((s) => s.selections)
  const { toast } = useToast()

  const availableTabs = useMemo(
    () => (match ? getAvailableMarketTabs(match.markets) : []),
    [match],
  )

  useEffect(() => {
    if (!availableTabs.length) return
    if (!availableTabs.includes(activeMarket)) {
      setActiveMarket(availableTabs[0])
    }
  }, [availableTabs, activeMarket])

  if (isLoading) {
    return <MatchDetailSkeleton />
  }

  if (isError || !match) {
    return (
      <div className="space-y-4">
        <QueryErrorFallback onRetry={() => refetch()} />
      </div>
    )
  }

  const canBet = match.status === 'scheduled' || match.status === 'live'
  const matchSelectionIds = new Set(
    selections.filter((s) => s.matchId === match.id).map((s) => s.selectionId),
  )
  const slipCount = selections.length

  const handleSelect = (selectionId: string, label: string, value: number) => {
    if (!canBet) {
      toast('Cannot bet on this match', 'error')
      return
    }
    addSelection({
      matchId: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      marketType: activeMarket,
      selectionId,
      selectionLabel: label,
      odds: value,
    })
    toast('Added to bet slip', 'success')
  }

  return (
    <div className="space-y-4 pb-4">
      <MatchDetailHero match={match} />

      <MatchDetailMarkets
        match={match}
        activeMarket={activeMarket}
        onMarketChange={setActiveMarket}
        canBet={canBet}
        selectedSelectionIds={matchSelectionIds}
        slipCount={slipCount}
        onSelect={handleSelect}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-text-muted">
          Virtual credits only — odds refresh every 30 seconds.
        </p>
        <Link to={ROUTES.BET_SLIP}>
          <Button variant="primary" size="md" className="w-full sm:w-auto">
            Open bet slip
          </Button>
        </Link>
      </div>
    </div>
  )
}
