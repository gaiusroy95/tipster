import type { Market } from '../types/overtime';
import { sportsService } from '../services/sports.service';

interface BuiltSelection {
  id: string;
  label: string;
  value: number;
  marketType: string;
}

export interface ResolvedSelection {
  selectionLabel: string;
  odds: number;
  homeTeamName: string;
  awayTeamName: string;
  leagueName: string | null;
  matchStartTime: Date | null;
  sportId: string | null;
  isLive: boolean;
}

function coerceDecimalOdds(odd: { decimal?: number } | undefined): number {
  if (!odd) return 0;
  const d = odd.decimal;
  return typeof d === 'number' && d > 1 ? d : 0;
}

function decimalToMalay(decimal: number): number {
  if (decimal >= 2) return decimal - 1;
  return -(1 / (decimal - 1));
}

function isValidOddsValue(value: number): boolean {
  return Number.isFinite(value) && value !== 0;
}

function selectionId(
  gameId: string,
  marketType: string,
  index: number,
  line?: number,
): string {
  const linePart = line !== undefined ? `-${line}` : '';
  return `${gameId}-${marketType}-${index}${linePart}`;
}

function enrichChild(child: Market, parent: Market): Market {
  return {
    ...parent,
    ...child,
    odds: child.odds,
    line: child.line,
    type: child.type,
    typeId: child.typeId,
    homeTeam: parent.homeTeam,
    awayTeam: parent.awayTeam,
    leagueName: parent.leagueName,
    sport: parent.sport,
    maturityDate: parent.maturityDate,
    statusCode: parent.statusCode,
  };
}

function buildSelectionsForMarket(market: Market): BuiltSelection[] {
  const gameId = market.gameId;
  const selections: BuiltSelection[] = [];

  if (market.odds?.length) {
    const labels =
      market.odds.length >= 3
        ? [market.homeTeam, 'Draw', market.awayTeam]
        : [market.homeTeam, market.awayTeam];

    market.odds.forEach((odd, index) => {
      const value = coerceDecimalOdds(odd);
      if (isValidOddsValue(value)) {
        selections.push({
          id: selectionId(gameId, 'winner', index),
          label: labels[index] ?? `Option ${index + 1}`,
          value,
          marketType: 'winner',
        });
      }
    });

    const homeDecimal = coerceDecimalOdds(market.odds[0]);
    const awayDecimal = coerceDecimalOdds(
      market.odds[market.odds.length >= 3 ? 2 : 1],
    );
    if (isValidOddsValue(homeDecimal) && isValidOddsValue(awayDecimal)) {
      selections.push({
        id: selectionId(gameId, 'malay', 0),
        label: market.homeTeam,
        value: decimalToMalay(homeDecimal),
        marketType: 'malay',
      });
      selections.push({
        id: selectionId(gameId, 'malay', 1),
        label: market.awayTeam,
        value: decimalToMalay(awayDecimal),
        marketType: 'malay',
      });
    }
  }

  for (const child of market.childMarkets ?? []) {
    const enriched = enrichChild(child, market);

    if (enriched.line != null && enriched.odds?.length >= 2) {
      const line = enriched.line;
      const awayLine = -line;
      const homeDecimal = coerceDecimalOdds(enriched.odds[0]);
      const awayDecimal = coerceDecimalOdds(enriched.odds[1]);

      const typeLower = enriched.type?.toLowerCase() ?? '';
      const isTotal =
        typeLower.includes('total') ||
        typeLower.includes('over') ||
        enriched.typeId === 10001;

      if (isTotal) {
        if (isValidOddsValue(homeDecimal)) {
          selections.push({
            id: selectionId(gameId, 'over_under', 0, line),
            label: `Over ${line}`,
            value: homeDecimal,
            marketType: 'over_under',
          });
        }
        if (isValidOddsValue(awayDecimal)) {
          selections.push({
            id: selectionId(gameId, 'over_under', 1, line),
            label: `Under ${line}`,
            value: awayDecimal,
            marketType: 'over_under',
          });
        }
      } else {
        if (isValidOddsValue(homeDecimal)) {
          selections.push({
            id: selectionId(gameId, 'handicap', 0, line),
            label: `${enriched.homeTeam} ${line}`,
            value: homeDecimal,
            marketType: 'handicap',
          });
        }
        if (isValidOddsValue(awayDecimal)) {
          selections.push({
            id: selectionId(gameId, 'handicap', 1, awayLine),
            label: `${enriched.awayTeam} ${awayLine > 0 ? '+' : ''}${awayLine}`,
            value: awayDecimal,
            marketType: 'handicap',
          });
        }
      }
    }
  }

  return selections;
}

export async function resolveBetSelection(
  matchId: string,
  marketType: string,
  selectionId: string,
): Promise<ResolvedSelection | null> {
  const market = await sportsService.getMarketOrNull(10, matchId);
  if (!market) return null;

  const selections = buildSelectionsForMarket(market);
  const match = selections.find(
    (s) => s.id === selectionId && s.marketType === marketType,
  );
  if (!match) return null;

  return {
    selectionLabel: match.label,
    odds: match.value,
    homeTeamName: market.homeTeam,
    awayTeamName: market.awayTeam,
    leagueName: market.leagueName ?? null,
    matchStartTime: market.maturityDate ? new Date(market.maturityDate) : null,
    sportId: market.sport ?? null,
    isLive: market.statusCode === 'ongoing',
  };
}

export function isMatchFinished(market: Market): boolean {
  return market.isResolved || market.statusCode === 'resolved';
}
