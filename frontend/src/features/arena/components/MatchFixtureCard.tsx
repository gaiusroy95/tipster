import { Link } from 'react-router-dom'
import {
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
  FireIcon,
} from '@heroicons/react/24/outline'
import { LiveBadge } from '@/shared/components/LiveBadge'
import { BettingOddsButton } from '@/shared/components/BettingOddsButton'
import { BettingMarketColumn } from '@/shared/components/BettingMarketColumn'
import { useBetSlipStore } from '@/features/betting/stores/betSlipStore'
import { useToast } from '@/shared/components/ui/Toast'
import { formatMatchDate, formatMatchTime } from '@/shared/utils/formatDate'
import { formatSelectionLabel } from '@/shared/utils/formatOdds'
import { matchPath } from '@/core/constants/routes'
import type { MatchWithTeams } from '@/features/fixtures/hooks/useFixtures'
import { MARKET_TYPES, type MarketType } from '@/core/constants/markets'
import type { OddsSelection } from '@/mocks/data/types'
import { cn } from '@/shared/utils/cn'

interface MatchFixtureCardProps {
  match: MatchWithTeams
  featured?: boolean
}

function winnerDisplayLabel(label: string, match: MatchWithTeams): string {
  if (label === match.homeTeam.name) return match.homeTeam.shortName
  if (label === match.awayTeam.name) return match.awayTeam.shortName
  return label
}

export function MatchFixtureCard({ match, featured = false }: MatchFixtureCardProps) {
  const addSelection = useBetSlipStore((s) => s.addSelection)
  const selections = useBetSlipStore((s) => s.selections)
  const { toast } = useToast()

  const winner = match.markets.find((m) => m.marketType === MARKET_TYPES.WINNER)
  const hcp = match.markets.find((m) => m.marketType === MARKET_TYPES.HANDICAP)
  const ou = match.markets.find((m) => m.marketType === MARKET_TYPES.OVER_UNDER)
  const canBet = match.status === 'scheduled' || match.status === 'live'

  const pickOdds = (marketType: MarketType, selection: OddsSelection) => {
    if (!canBet) return
    addSelection({
      matchId: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      marketType,
      selectionId: selection.id,
      selectionLabel: selection.label,
      odds: selection.value,
    })
    toast('Added to bet slip', 'success')
  }

  const isSelected = (selectionId: string) =>
    selections.some((s) => s.matchId === match.id && s.selectionId === selectionId)

  const score =
    match.status === 'live' || match.status === 'finished'
      ? `${match.homeScore ?? 0} : ${match.awayScore ?? 0}`
      : null

  const extraMarkets = match.markets.length * 127 + 382
  const detailPath = matchPath(match.id)

  const hasOddsColumns = winner || hcp || ou

  const winnerColumn = winner ? (
    <BettingMarketColumn title="Winner" className="min-w-[96px] sm:min-w-[104px]">
      {winner.selections.map((sel) => (
        <BettingOddsButton
          key={sel.id}
          label={winnerDisplayLabel(sel.label, match)}
          labelTitle={sel.label}
          value={sel.value}
          marketType={MARKET_TYPES.WINNER}
          selected={isSelected(sel.id)}
          disabled={!canBet}
          onClick={() => pickOdds(MARKET_TYPES.WINNER, sel)}
          className="h-full min-h-0"
        />
      ))}
    </BettingMarketColumn>
  ) : null

  const handicapColumn = hcp ? (
    <BettingMarketColumn title="Handicap" showInfo className="min-w-[96px] sm:min-w-[104px]">
      {hcp.selections.slice(0, 2).map((sel) => (
        <BettingOddsButton
          key={sel.id}
          label={formatSelectionLabel(MARKET_TYPES.HANDICAP, sel.label, sel.handicap)}
          value={sel.value}
          marketType={MARKET_TYPES.HANDICAP}
          selected={isSelected(sel.id)}
          disabled={!canBet}
          onClick={() => pickOdds(MARKET_TYPES.HANDICAP, sel)}
          className="h-full min-h-0"
        />
      ))}
    </BettingMarketColumn>
  ) : null

  const totalColumn = ou ? (
    <BettingMarketColumn title="Total" className="min-w-[96px] sm:min-w-[104px]">
      {ou.selections.slice(0, 2).map((sel) => (
        <BettingOddsButton
          key={sel.id}
          label={formatSelectionLabel(MARKET_TYPES.OVER_UNDER, sel.label, undefined, sel.line)}
          value={sel.value}
          marketType={MARKET_TYPES.OVER_UNDER}
          selected={isSelected(sel.id)}
          disabled={!canBet}
          onClick={() => pickOdds(MARKET_TYPES.OVER_UNDER, sel)}
          className="h-full min-h-0"
        />
      ))}
    </BettingMarketColumn>
  ) : null

  return (
    <article
      className={cn(
        'relative border bg-bg-surface',
        featured ? 'border-accent-primary/40' : 'border-border-default',
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col p-4 lg:max-w-[220px] lg:border-r border-border-default/60">
          {featured && (
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Featured
            </p>
          )}
          <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-text-muted">
            <span>{match.league.name}</span>
            <span className="text-text-muted/50">·</span>
            <span>{formatMatchDate(match.startTime)}</span>
            <span className="text-text-primary">{formatMatchTime(match.startTime)}</span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-bg-elevated text-xs font-bold font-mono text-accent-secondary">
                {match.homeTeam.shortName}
              </span>
              <span className="font-semibold truncate">{match.homeTeam.name}</span>
            </div>
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-bg-elevated text-xs font-bold font-mono text-accent-secondary">
                {match.awayTeam.shortName}
              </span>
              <span className="font-semibold truncate">{match.awayTeam.name}</span>
            </div>
          </div>

          {score && (
            <p className="mt-3 font-mono text-xl font-bold tracking-widest text-accent-primary">{score}</p>
          )}

          <div className="mt-3 flex items-center gap-2">
            <LiveBadge status={match.status} minute={match.minute} />
          </div>
        </div>

        {hasOddsColumns && (
          <>
            {/* xs: winner only + link to full markets */}
            <div className="sm:hidden border-t border-border-default/60 p-4 space-y-3">
              {winnerColumn}
              <Link
                to={detailPath}
                className="flex items-center justify-center gap-2 rounded-lg border border-border-default bg-bg-elevated px-3 py-2.5 text-sm font-semibold text-accent-secondary min-h-[44px] hover:border-accent-secondary/40 transition-colors"
              >
                All markets
                <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {/* sm–lg: horizontal scroll markets */}
            <div
              className="hidden sm:flex lg:hidden flex-1 gap-2 p-4 min-h-[148px] overflow-x-auto scroll-snap-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="scroll-snap-item shrink-0">{winnerColumn}</div>
              <div className="scroll-snap-item shrink-0">{handicapColumn}</div>
              <div className="scroll-snap-item shrink-0">{totalColumn}</div>
            </div>

            {/* lg+: full row */}
            <div className="hidden lg:flex min-w-0 flex-1 items-stretch gap-2 p-4 lg:py-3 min-h-[148px]">
              {winnerColumn}
              {handicapColumn}
              {totalColumn}
            </div>
          </>
        )}

        <div className="flex flex-row lg:flex-col items-center justify-between gap-3 border-t lg:border-t-0 lg:border-l border-border-default/60 px-4 py-3 lg:py-4 lg:min-w-[72px]">
          <div className="flex items-center gap-1.5 text-accent-primary">
            <FireIcon className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-bold">+10% XP</span>
          </div>

          <Link
            to={detailPath}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border-default bg-betting-btn text-text-muted hover:border-cyan-400/35 hover:text-cyan-400 transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Open match markets"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </Link>

          <div className="flex items-center gap-0.5 text-xs font-mono text-text-muted">
            <span>+{extraMarkets}</span>
            <ChevronDownIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
        </div>
      </div>
    </article>
  )
}
