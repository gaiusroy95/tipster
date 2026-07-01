export const BETTING_RULES = {
  initialBalance: 1000000,
  standardStake: 25000,
  premiumStake: 100000,
  allowedStakes: [25000, 100000] as const,
  dailyBetLimit: 3,
  dailyBigBetLimit: 3,
  cancellationPenaltyPercent: 10,
} as const;

export type BetSize = 'small' | 'big';

export function getBetSize(stake: number): BetSize | null {
  if (stake === BETTING_RULES.standardStake) return 'small';
  if (stake === BETTING_RULES.premiumStake) return 'big';
  return null;
}

export function calculateCancellationPenalty(stake: number): number {
  return Math.round(
    stake * (BETTING_RULES.cancellationPenaltyPercent / 100),
  );
}

export function malayReturn(stake: number, odds: number): number {
  if (odds > 0) return stake + stake * odds;
  if (odds < 0) return stake + stake / Math.abs(odds);
  return stake;
}

const MALAY_ODDS_MARKET_TYPES = new Set([
  'winner',
  'handicap',
  'over_under',
  'malay',
]);

export function computePotentialReturn(
  stake: number,
  odds: number,
  marketType: string,
): number {
  if (MALAY_ODDS_MARKET_TYPES.has(marketType)) {
    return Math.round(malayReturn(stake, odds));
  }
  return Math.round(stake * (odds > 0 ? odds : 2));
}

/** Net profit displayed as "Potential win" (excludes returned stake). */
export function computePotentialWin(
  stake: number,
  odds: number,
  marketType: string,
): number {
  return computePotentialReturn(stake, odds, marketType) - stake;
}

export function utcDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}
