/** Malay odds from American lines (e.g. +270 → +2.70, -65 → -0.65). */
export function americanToMalay(american: number): number {
  if (!Number.isFinite(american) || american === 0) return 0
  return Math.round(american / 100 * 100) / 100
}

/** Convert decimal odds to Malay format. */
export function decimalToMalay(decimal: number): number {
  if (!decimal || decimal <= 1) return 0
  if (decimal >= 2) return Math.round((decimal - 1) * 100) / 100
  return Math.round((-1 / (decimal - 1)) * 100) / 100
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

type MalayOddsObject = {
  american?: number
  decimal?: number
  normalizedImplied?: number
}

/**
 * Resolve Malay odds from an Overtime odds entry.
 * Prefer American (÷100) when present — matches industry Malay display.
 * Fall back to decimal conversion for basic-API implied-probability numbers.
 */
export function coerceMalayOdds(
  odd: number | MalayOddsObject | undefined,
  decimalFallback: number,
): number {
  if (odd != null && typeof odd !== 'number') {
    const american = odd.american
    if (american != null && Number.isFinite(american) && american !== 0) {
      const malay = americanToMalay(american)
      if (isValidMalayOdds(malay)) return malay
    }
  }
  return decimalToMalay(decimalFallback)
}
