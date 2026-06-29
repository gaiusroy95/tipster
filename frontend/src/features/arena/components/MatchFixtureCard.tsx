import { Link } from 'react-router-dom'
import {
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
  FireIcon,
} from '@heroicons/react/24/outline'
import { LiveBadge } from '@/shared/components/LiveBadge'
import { LeagueLogo } from '@/shared/components/LeagueLogo'
import { TeamCountryBadge } from '@/shared/components/TeamCountryBadge'
import { BettingOddsButton } from '@/shared/components/BettingOddsButton'
import { BettingMarketColumn } from '@/shared/components/BettingMarketColumn'
import { useBetSlipStore } from '@/features/betting/stores/betSlipStore'
import { useRequireAuthForBet } from '@/features/betting/hooks/useRequireAuthForBet'
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

const DESKTOP_COLUMN_CLASS = 'min-w-0 flex-1 basis-0'

function winnerDisplayLabel(label: string, match: MatchWithTeams): string {
  if (label === match.homeTeam.name) return match.homeTeam.shortName
  if (label === match.awayTeam.name) return match.awayTeam.shortName
  return label
}

function MatchMetaActions({
  detailPath,
  extraMarkets,
  layout,
}: {
  detailPath: string
  extraMarkets: number
  layout: 'bar' | 'column'
}) {
  if (layout === 'column') {
    return (
      <div className="flex shrink-0 flex-col items-center justify-between gap-2 border-t border-border-default/50 px-2 py-4 xl:w-[80px] xl:min-w-[80px] xl:border-t-0 xl:border-l">
        <div className="flex min-w-0 items-center gap-1 text-accent-primary">
          <FireIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="text-[10px] font-bold whitespace-nowrap xl:text-xs">+10% XP</span>
        </div>

        <Link
          to={detailPath}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border-default/80 bg-betting-btn text-text-muted hover:border-cyan-400/35 hover:text-cyan-400 transition-colors"
          aria-label="Open match markets"
        >
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </Link>

        <div className="flex shrink-0 items-center gap-0.5 text-xs font-mono text-text-muted whitespace-nowrap">
          <span>+{extraMarkets}</span>
          <ChevronDownIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-border-default/50 bg-bg-elevated/25 px-3 py-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:py-2.5">
      <div className="flex min-w-0 items-center justify-between gap-2 sm:contents">
        <div className="flex min-w-0 items-center gap-1.5 rounded-full border border-accent-primary/25 bg-accent-primary/10 px-2.5 py-1.5 text-accent-primary shrink-0">
          <FireIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="text-[11px] font-bold whitespace-nowrap">+10% XP</span>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 rounded-md border border-border-default/60 bg-bg-surface px-2.5 py-1.5 text-xs font-mono text-text-muted whitespace-nowrap">
          <span>+{extraMarkets}</span>
          <ChevronDownIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      </div>

      <Link
        to={detailPath}
        className="flex w-full sm:w-auto sm:shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border-default/80 bg-bg-surface px-3 py-2.5 text-xs font-semibold text-accent-secondary min-h-[40px] hover:border-accent-secondary/40 transition-colors"
      >
        All markets
        <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      </Link>
    </div>
  )
}

export function MatchFixtureCard({ match, featured = false }: MatchFixtureCardProps) {
  const addSelection = useBetSlipStore((s) => s.addSelection)
  const selections = useBetSlipStore((s) => s.selections)
  const requireAuthForBet = useRequireAuthForBet()
  const { toast } = useToast()

  const winner = match.markets.find((m) => m.marketType === MARKET_TYPES.WINNER)
  const hcp = match.markets.find((m) => m.marketType === MARKET_TYPES.HANDICAP)
  const ou = match.markets.find((m) => m.marketType === MARKET_TYPES.OVER_UNDER)
  const canBet = match.status === 'scheduled' || match.status === 'live'

  const pickOdds = (marketType: MarketType, selection: OddsSelection) => {
    if (!requireAuthForBet()) return
    if (!canBet) {
      toast('Cannot bet on this match', 'error')
      return
    }
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

  const homeScore = match.homeScore ?? 0
  const awayScore = match.awayScore ?? 0
  const showScore = match.status === 'live' || match.status === 'finished'

  const extraMarkets = match.markets.length * 127 + 382
  const detailPath = matchPath(match.id)

  const hasOddsColumns = winner || hcp || ou

  const buildDesktopColumns = () => {
    const winnerColumn = winner ? (
      <BettingMarketColumn title="1x2" titleShort="1x2" className={DESKTOP_COLUMN_CLASS}>
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
            variant="stacked"
            className="h-full min-h-0"
          />
        ))}
      </BettingMarketColumn>
    ) : null

    const handicapColumn = hcp ? (
      <BettingMarketColumn title="Handicap" titleShort="HCP" showInfo className={DESKTOP_COLUMN_CLASS}>
        {hcp.selections.slice(0, 2).map((sel) => (
          <BettingOddsButton
            key={sel.id}
            label={formatSelectionLabel(MARKET_TYPES.HANDICAP, sel.label, sel.handicap)}
            value={sel.value}
            marketType={MARKET_TYPES.HANDICAP}
            selected={isSelected(sel.id)}
            disabled={!canBet}
            onClick={() => pickOdds(MARKET_TYPES.HANDICAP, sel)}
            variant="stacked"
            className="h-full min-h-0"
          />
        ))}
      </BettingMarketColumn>
    ) : null

    const totalColumn = ou ? (
      <BettingMarketColumn title="Total" className={DESKTOP_COLUMN_CLASS}>
        {ou.selections.slice(0, 2).map((sel) => {
          const fullLabel = formatSelectionLabel(
            MARKET_TYPES.OVER_UNDER,
            sel.label,
            undefined,
            sel.line,
          )
          return (
            <BettingOddsButton
              key={sel.id}
              label={formatSelectionLabel(
                MARKET_TYPES.OVER_UNDER,
                sel.label,
                undefined,
                sel.line,
                { short: true },
              )}
              labelTitle={fullLabel}
              value={sel.value}
              marketType={MARKET_TYPES.OVER_UNDER}
              selected={isSelected(sel.id)}
              disabled={!canBet}
              onClick={() => pickOdds(MARKET_TYPES.OVER_UNDER, sel)}
              variant="stacked"
              className="h-full min-h-0"
            />
          )
        })}
      </BettingMarketColumn>
    ) : null

    return { winnerColumn, handicapColumn, totalColumn }
  }

  const desktopColumns = buildDesktopColumns()

  const secondarySelections: Array<{
    key: string
    marketType: MarketType
    selection: OddsSelection
    label: string
    labelTitle?: string
  }> = []

  if (hcp) {
    hcp.selections.slice(0, 2).forEach((sel) => {
      secondarySelections.push({
        key: sel.id,
        marketType: MARKET_TYPES.HANDICAP,
        selection: sel,
        label: formatSelectionLabel(MARKET_TYPES.HANDICAP, sel.label, sel.handicap, undefined, {
          short: true,
        }),
        labelTitle: formatSelectionLabel(MARKET_TYPES.HANDICAP, sel.label, sel.handicap),
      })
    })
  }

  if (ou) {
    ou.selections.slice(0, 2).forEach((sel) => {
      secondarySelections.push({
        key: sel.id,
        marketType: MARKET_TYPES.OVER_UNDER,
        selection: sel,
        label: formatSelectionLabel(MARKET_TYPES.OVER_UNDER, sel.label, undefined, sel.line, {
          short: true,
        }),
        labelTitle: formatSelectionLabel(
          MARKET_TYPES.OVER_UNDER,
          sel.label,
          undefined,
          sel.line,
        ),
      })
    })
  }

  return (
    <article
      className={cn(
        'overflow-hidden rounded-lg border bg-bg-surface',
        featured ? 'border-accent-primary/45 ring-1 ring-accent-primary/15' : 'border-border-default/80',
      )}
    >
      <div className="flex min-w-0 flex-col xl:flex-row xl:items-stretch">
        {/* Mobile / tablet card — full-width winner odds, scannable teams */}
        <div className="xl:hidden min-w-0">
          <div
            className={cn(
              'p-3.5 space-y-3',
              featured && 'bg-gradient-to-br from-accent-primary/8 via-transparent to-transparent',
            )}
          >
            {featured && (
              <span className="inline-flex items-center rounded-md border border-accent-primary/30 bg-accent-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-primary">
                Featured
              </span>
            )}

            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-0.5">
                <p className="flex items-center gap-1.5 text-[11px] text-text-muted">
                  <LeagueLogo
                    name={match.league.name}
                    country={match.league.country}
                    logoUrl={match.league.logoUrl}
                    size="xs"
                    className="h-4 w-4 rounded shrink-0"
                  />
                  <span className="truncate">{match.league.name}</span>
                </p>
                <p className="text-xs font-semibold text-text-primary">
                  {formatMatchDate(match.startTime)} · {formatMatchTime(match.startTime)}
                </p>
              </div>
              <LiveBadge status={match.status} minute={match.minute} />
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div className="min-w-0 flex flex-col items-center gap-1.5 text-center">
                <TeamCountryBadge
                  teamName={match.homeTeam.name}
                  shortName={match.homeTeam.shortName}
                  logoUrl={match.homeTeam.logoUrl}
                  side="home"
                  size="sm"
                />
                <p className="text-sm font-semibold leading-tight line-clamp-2">{match.homeTeam.name}</p>
              </div>
              <div className="flex flex-col items-center justify-center px-1 shrink-0">
                {showScore ? (
                  <p className="font-mono text-lg font-bold tracking-wider text-accent-primary">
                    {homeScore}
                    <span className="mx-1 text-text-muted">:</span>
                    {awayScore}
                  </p>
                ) : (
                  <span className="text-xs font-semibold text-text-muted">vs</span>
                )}
              </div>
              <div className="min-w-0 flex flex-col items-center gap-1.5 text-center">
                <TeamCountryBadge
                  teamName={match.awayTeam.name}
                  shortName={match.awayTeam.shortName}
                  logoUrl={match.awayTeam.logoUrl}
                  side="away"
                  size="sm"
                />
                <p className="text-sm font-semibold leading-tight line-clamp-2">{match.awayTeam.name}</p>
              </div>
            </div>

            {winner && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">1x2</p>
                <div className="grid grid-cols-3 gap-1.5">
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
                      variant="stacked"
                      className="min-h-[48px]"
                    />
                  ))}
                </div>
              </div>
            )}

            {secondarySelections.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  HCP · Total
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {secondarySelections.map((item) => (
                    <BettingOddsButton
                      key={item.key}
                      label={item.label}
                      labelTitle={item.labelTitle}
                      value={item.selection.value}
                      marketType={item.marketType}
                      selected={isSelected(item.selection.id)}
                      disabled={!canBet}
                      onClick={() => pickOdds(item.marketType, item.selection)}
                      variant="stacked"
                      className="min-h-[44px]"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {hasOddsColumns && (
            <MatchMetaActions detailPath={detailPath} extraMarkets={extraMarkets} layout="bar" />
          )}
        </div>

        {/* Desktop info column */}
        <div
          className={cn(
            'hidden xl:flex min-w-0 flex-col p-4',
            featured && 'bg-gradient-to-br from-accent-primary/8 via-transparent to-transparent',
            'xl:w-[220px] xl:min-w-[220px] xl:max-w-[220px] xl:shrink-0 xl:border-r xl:border-border-default/50',
          )}
        >
          {featured ? (
            <span className="mb-2 inline-flex items-center rounded-md border border-accent-primary/30 bg-accent-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-primary">
              Featured
            </span>
          ) : (
            <span className="mb-2 h-[22px]" aria-hidden="true" />
          )}
          <div className="mb-3 space-y-1 text-xs font-medium text-text-muted leading-snug">
            <p className="flex items-center gap-1.5 line-clamp-2">
              <LeagueLogo
                name={match.league.name}
                country={match.league.country}
                logoUrl={match.league.logoUrl}
                size="xs"
                className="h-5 w-5 rounded-md shrink-0"
              />
              <span className="min-w-0">{match.league.name}</span>
            </p>
            <p className="text-text-primary font-semibold">
              {formatMatchDate(match.startTime)} · {formatMatchTime(match.startTime)}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 min-w-0">
              <TeamCountryBadge
                teamName={match.homeTeam.name}
                shortName={match.homeTeam.shortName}
                logoUrl={match.homeTeam.logoUrl}
                side="home"
                size="sm"
              />
              <span className="font-semibold text-sm truncate">{match.homeTeam.name}</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <TeamCountryBadge
                teamName={match.awayTeam.name}
                shortName={match.awayTeam.shortName}
                logoUrl={match.awayTeam.logoUrl}
                side="away"
                size="sm"
              />
              <span className="font-semibold text-sm truncate">{match.awayTeam.name}</span>
            </div>
          </div>

          {showScore && (
            <p className="mt-3 font-mono text-xl font-bold tracking-widest text-accent-primary">
              {homeScore} : {awayScore}
            </p>
          )}

          <div className="mt-3">
            <LiveBadge status={match.status} minute={match.minute} />
          </div>
        </div>

        {hasOddsColumns && (
          <div className="hidden xl:flex min-w-0 flex-1 items-stretch gap-2 p-3 pl-2 min-h-[152px] overflow-hidden">
            {desktopColumns.winnerColumn}
            {desktopColumns.handicapColumn}
            {desktopColumns.totalColumn}
          </div>
        )}

        <div className="hidden xl:flex shrink-0">
          <MatchMetaActions detailPath={detailPath} extraMarkets={extraMarkets} layout="column" />
        </div>
      </div>
    </article>
  )
}
