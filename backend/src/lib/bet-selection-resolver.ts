import type { Market } from '../types/overtime';
import { sportsService } from '../services/sports.service';
import {
  coerceDecimalOdds,
  decimalToMalay,
  isValidDecimalOdds,
  isValidMalayOdds,
} from '../utils/overtime-odds.util';

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

function classifyMarketKind(market: Market): string | null {
  const typeId = market.typeId;
  if (typeId === 0) return 'winner';
  if (typeId === 10001) return 'handicap';
  if (typeId === 10002) return 'over_under';

  const key = (market.type ?? '').toLowerCase();
  if (key.includes('winner') && !key.includes('period') && !key.includes('half')) {
    return 'winner';
  }
  if (key.includes('spread') || key.includes('handicap')) return 'handicap';
  if (key.includes('total') || key.includes('overunder') || key.includes('over_under')) {
    return 'over_under';
  }
  return null;
}

function addWinnerSelections(
  market: Market,
  gameId: string,
  selections: BuiltSelection[],
): Market | null {
  if (!market.odds?.length) return null;

  const labels =
    market.odds.length >= 3
      ? [market.homeTeam, 'Draw', market.awayTeam]
      : [market.homeTeam, market.awayTeam];

  let added = false;
  market.odds.forEach((odd, index) => {
    const decimal = coerceDecimalOdds(odd);
    if (!isValidDecimalOdds(decimal)) return;

    const value = decimalToMalay(decimal);
    if (!isValidMalayOdds(value)) return;

    const id = selectionId(gameId, 'winner', index);
    if (selections.some((s) => s.id === id)) return;

    selections.push({
      id,
      label: labels[index] ?? `Option ${index + 1}`,
      value,
      marketType: 'winner',
    });
    added = true;
  });

  return added ? market : null;
}

function addHandicapSelections(
  market: Market,
  gameId: string,
  selections: BuiltSelection[],
): void {
  if (market.line == null || !market.odds?.length || market.odds.length < 2) return;

  const line = market.line;
  const awayLine = -line;
  const homeDecimal = coerceDecimalOdds(market.odds[0]);
  const awayDecimal = coerceDecimalOdds(market.odds[1]);

  if (isValidDecimalOdds(homeDecimal)) {
    const value = decimalToMalay(homeDecimal);
    if (isValidMalayOdds(value)) {
      const id = selectionId(gameId, 'handicap', 0, line);
      if (!selections.some((s) => s.id === id)) {
        selections.push({
          id,
          label: `${market.homeTeam} ${line}`,
          value,
          marketType: 'handicap',
        });
      }
    }
  }
  if (isValidDecimalOdds(awayDecimal)) {
    const value = decimalToMalay(awayDecimal);
    if (isValidMalayOdds(value)) {
      const id = selectionId(gameId, 'handicap', 1, awayLine);
      if (!selections.some((s) => s.id === id)) {
        selections.push({
          id,
          label: `${market.awayTeam} ${awayLine > 0 ? '+' : ''}${awayLine}`,
          value,
          marketType: 'handicap',
        });
      }
    }
  }
}

function addOverUnderSelections(
  market: Market,
  gameId: string,
  selections: BuiltSelection[],
): void {
  if (market.line == null || !market.odds?.length || market.odds.length < 2) return;

  const line = market.line;
  const overDecimal = coerceDecimalOdds(market.odds[0]);
  const underDecimal = coerceDecimalOdds(market.odds[1]);

  if (isValidDecimalOdds(overDecimal)) {
    const value = decimalToMalay(overDecimal);
    if (isValidMalayOdds(value)) {
      const id = selectionId(gameId, 'over_under', 0, line);
      if (!selections.some((s) => s.id === id)) {
        selections.push({
          id,
          label: `Over ${line}`,
          value,
          marketType: 'over_under',
        });
      }
    }
  }
  if (isValidDecimalOdds(underDecimal)) {
    const value = decimalToMalay(underDecimal);
    if (isValidMalayOdds(value)) {
      const id = selectionId(gameId, 'over_under', 1, line);
      if (!selections.some((s) => s.id === id)) {
        selections.push({
          id,
          label: `Under ${line}`,
          value,
          marketType: 'over_under',
        });
      }
    }
  }
}

function buildSelectionsForMarket(market: Market): BuiltSelection[] {
  const gameId = market.gameId;
  const selections: BuiltSelection[] = [];
  const childMarkets = (market.childMarkets ?? []).map((child) =>
    enrichChild(child, market),
  );
  const candidates = [market, ...childMarkets];

  let hasWinner = false;
  let hasHandicap = false;
  let hasOverUnder = false;

  for (const candidate of candidates) {
    const kind = classifyMarketKind(candidate);
    if (!kind) continue;

    if (kind === 'winner' && !hasWinner) {
      const source = addWinnerSelections(candidate, gameId, selections);
      if (source) {
        hasWinner = true;
      }
    } else if (kind === 'handicap' && !hasHandicap) {
      const before = selections.length;
      addHandicapSelections(candidate, gameId, selections);
      if (selections.length > before) hasHandicap = true;
    } else if (kind === 'over_under' && !hasOverUnder) {
      const before = selections.length;
      addOverUnderSelections(candidate, gameId, selections);
      if (selections.length > before) hasOverUnder = true;
    }
  }

  return selections;
}

export function resolveBetSelectionFromMarket(
  market: Market,
  marketType: string,
  selectionIdValue: string,
): ResolvedSelection | null {
  const selections = buildSelectionsForMarket(market);
  const match = selections.find(
    (s) => s.id === selectionIdValue && s.marketType === marketType,
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

export async function resolveBetSelection(
  matchId: string,
  marketType: string,
  selectionIdValue: string,
): Promise<ResolvedSelection | null> {
  const market = await sportsService.getMarketOrNull(10, matchId);
  if (!market) return null;
  return resolveBetSelectionFromMarket(market, marketType, selectionIdValue);
}

export function isMatchFinished(market: Market): boolean {
  return market.isResolved || market.statusCode === 'resolved';
}
