/** Convert decimal odds to Malay format, clamped to [-1.00, +1.00]. */
export function decimalToMalay(decimal: number): number {
  if (!decimal || decimal <= 1) return 0

  let malay: number
  if (decimal >= 2) {
    malay = Math.round((decimal - 1) * 100) / 100
    if (malay > 1) malay = 1
  } else {
    malay = Math.round((-1 / (decimal - 1)) * 100) / 100
    if (malay < -1) malay = -1
  }
  return malay
}

export function isValidMalayOdds(value: number): boolean {
  return Number.isFinite(value) && value !== 0
}

export function malayReturn(stake: number, odds: number): number {
  if (odds > 0) return stake + stake * odds
  if (odds < 0) return stake + stake / Math.abs(odds)
  return stake
}

export const MALAY_ODDS_MARKET_TYPES = new Set([
  'winner',
  'handicap',
  'over_under',
  'malay',
])

export function usesMalayOddsFormat(marketType: string): boolean {
  return MALAY_ODDS_MARKET_TYPES.has(marketType)
}
