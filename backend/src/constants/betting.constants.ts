export const BETTING_RULES = {
  initialBalance: 1000000,
  standardStake: 25000,
  premiumStake: 100000,
  allowedStakes: [25000, 100000] as const,
  dailyBetLimit: 3,
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
  return stake + stake;
}

export function computePotentialReturn(
  stake: number,
  odds: number,
  marketType: string,
): number {
  if (marketType === 'malay') {
    return Math.round(malayReturn(stake, odds));
  }
  return Math.round(stake * (odds > 0 ? odds : 2));
}

export function utcDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}
