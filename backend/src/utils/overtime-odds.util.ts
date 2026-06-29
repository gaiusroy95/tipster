type OddsInput =
  | number
  | {
      american?: number;
      decimal?: number;
      normalizedImplied?: number;
    }
  | undefined;

function americanToDecimal(american: number): number {
  if (!Number.isFinite(american) || american === 0) return 0;
  if (american > 0) return american / 100 + 1;
  return 100 / Math.abs(american) + 1;
}

/** Convert Overtime odds to decimal display values (expects decimal > 1). */
export function coerceDecimalOdds(odd: OddsInput): number {
  if (odd == null) return 0;

  if (typeof odd === 'number') {
    if (!Number.isFinite(odd) || odd <= 0) return 0;
    if (odd >= 1) return Math.round(odd * 100) / 100;
    return Math.round((1 / odd) * 100) / 100;
  }

  if (odd.decimal != null && Number.isFinite(odd.decimal) && odd.decimal > 1) {
    return odd.decimal;
  }
  if (
    odd.normalizedImplied != null &&
    Number.isFinite(odd.normalizedImplied) &&
    odd.normalizedImplied > 0 &&
    odd.normalizedImplied < 1
  ) {
    return Math.round((1 / odd.normalizedImplied) * 100) / 100;
  }
  if (odd.american != null && Number.isFinite(odd.american)) {
    return Math.round(americanToDecimal(odd.american) * 100) / 100;
  }
  return 0;
}

/** Malay odds from American lines (e.g. +270 → +2.70, -65 → -0.65). */
export function americanToMalay(american: number): number {
  if (!Number.isFinite(american) || american === 0) return 0;
  return Math.round(american / 100 * 100) / 100;
}

/** Convert decimal odds to Malay format. */
export function decimalToMalay(decimal: number): number {
  if (!decimal || decimal <= 1) return 0;
  if (decimal >= 2) return Math.round((decimal - 1) * 100) / 100;
  return Math.round((-1 / (decimal - 1)) * 100) / 100;
}

export function coerceMalayOdds(
  odd: OddsInput,
  decimalFallback: number,
): number {
  if (odd != null && typeof odd !== 'number') {
    const american = odd.american;
    if (american != null && Number.isFinite(american) && american !== 0) {
      const malay = americanToMalay(american);
      if (isValidMalayOdds(malay)) return malay;
    }
  }
  return decimalToMalay(decimalFallback);
}

export function isValidDecimalOdds(value: number): boolean {
  return Number.isFinite(value) && value > 1;
}

export function isValidMalayOdds(value: number): boolean {
  return Number.isFinite(value) && value !== 0;
}
