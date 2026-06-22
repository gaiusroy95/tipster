export const bettingRules = {
  initialBalance: 1000000,
  standardStake: 25000,
  premiumStake: 100000,
  allowedStakes: [25000, 100000] as const,
  dailyBetLimit: 3,
  cancellationPenaltyPercent: 10,
} as const

export type BetSize = 'small' | 'big'

export function getBetSize(stake: number): BetSize | null {
  if (stake === bettingRules.standardStake) return 'small'
  if (stake === bettingRules.premiumStake) return 'big'
  return null
}

export function isValidStake(stake: number): boolean {
  return getBetSize(stake) !== null
}

export function getStakeLabel(stake: number): string {
  if (stake === bettingRules.standardStake) return '25K'
  if (stake === bettingRules.premiumStake) return '100K'
  return String(stake)
}

export function calculateCancellationPenalty(stake: number): number {
  return Math.round(stake * (bettingRules.cancellationPenaltyPercent / 100))
}
