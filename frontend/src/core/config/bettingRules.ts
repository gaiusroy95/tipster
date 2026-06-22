export const bettingRules = {
  initialBalance: 10000,
  smallBetMax: 500,
  bigBetMin: 501,
  bigBetMax: 2000,
  dailyBigBetLimit: 3,
  cancellationPenaltyPercent: 10,
} as const

export type BetSize = 'small' | 'big'

export function getBetSize(stake: number): BetSize | null {
  if (stake <= 0) return null
  if (stake <= bettingRules.smallBetMax) return 'small'
  if (stake >= bettingRules.bigBetMin && stake <= bettingRules.bigBetMax) return 'big'
  return null
}

export function isValidStake(stake: number): boolean {
  return getBetSize(stake) !== null
}

export function calculateCancellationPenalty(stake: number): number {
  return Math.round(stake * (bettingRules.cancellationPenaltyPercent / 100))
}
