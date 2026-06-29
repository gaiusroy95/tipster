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

/** Convert decimal odds to Malay format, clamped to [-1.00, +1.00]. */
export function decimalToMalay(decimal: number): number {
  if (!decimal || decimal <= 1) return 0;

  let malay: number;
  if (decimal >= 2) {
    malay = Math.round((decimal - 1) * 100) / 100;
    if (malay > 1) malay = 1;
  } else {
    malay = Math.round((-1 / (decimal - 1)) * 100) / 100;
    if (malay < -1) malay = -1;
  }
  return malay;
}

export function isValidDecimalOdds(value: number): boolean {
  return Number.isFinite(value) && value > 1;
}

export function isValidMalayOdds(value: number): boolean {
  return Number.isFinite(value) && value !== 0;
}
