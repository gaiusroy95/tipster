export type BetOutcome = 'won' | 'lost' | 'void';

export interface ParsedSelection {
  marketType: string;
  selectionIndex: number;
  line?: number;
}

const SELECTION_SUFFIX =
  /-(winner|malay|handicap|over_under)-(\d+)(?:-(-?[\d.]+))?$/;

export function parseSelectionId(selectionId: string): ParsedSelection | null {
  const match = selectionId.match(SELECTION_SUFFIX);
  if (!match) return null;

  const marketType = match[1];
  const selectionIndex = Number(match[2]);
  const lineRaw = match[3];

  if (!Number.isFinite(selectionIndex)) return null;

  const parsed: ParsedSelection = { marketType, selectionIndex };
  if (lineRaw != null) {
    const line = Number(lineRaw);
    if (!Number.isFinite(line)) return null;
    parsed.line = line;
  }

  return parsed;
}

export function evaluateBetOutcome(params: {
  marketType: string;
  selectionIndex: number;
  line?: number;
  homeScore: number;
  awayScore: number;
  threeWayWinner?: boolean;
}): BetOutcome {
  const {
    marketType,
    selectionIndex,
    line,
    homeScore,
    awayScore,
    threeWayWinner = false,
  } = params;

  if (marketType === 'winner') {
    const isDraw = homeScore === awayScore;
    if (isDraw) {
      if (threeWayWinner && selectionIndex === 1) return 'won';
      return 'void';
    }
    const homeWins = homeScore > awayScore;
    if (selectionIndex === 0) return homeWins ? 'won' : 'lost';
    if (threeWayWinner && selectionIndex === 1) return 'lost';
    const awayIndex = threeWayWinner ? 2 : 1;
    if (selectionIndex === awayIndex) return homeWins ? 'lost' : 'won';
    return 'lost';
  }

  if (marketType === 'malay') {
    if (homeScore === awayScore) return 'lost';
    const homeWins = homeScore > awayScore;
    if (selectionIndex === 0) return homeWins ? 'won' : 'lost';
    if (selectionIndex === 1) return homeWins ? 'lost' : 'won';
    return 'lost';
  }

  if (marketType === 'handicap') {
    if (line == null) return 'void';
    const appliedLine = selectionIndex === 0 ? line : -line;
    const adjustedHome = homeScore + appliedLine;
    if (adjustedHome > awayScore) {
      return selectionIndex === 0 ? 'won' : 'lost';
    }
    if (adjustedHome < awayScore) {
      return selectionIndex === 1 ? 'won' : 'lost';
    }
    return 'void';
  }

  if (marketType === 'over_under') {
    if (line == null) return 'void';
    const total = homeScore + awayScore;
    if (total === line) return 'void';
    const overWins = total > line;
    if (selectionIndex === 0) return overWins ? 'won' : 'lost';
    if (selectionIndex === 1) return overWins ? 'lost' : 'won';
    return 'lost';
  }

  return 'void';
}
