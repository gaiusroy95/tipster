export function formatCredits(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCreditsWithLabel(amount: number): string {
  return `${formatCredits(amount)} credits`
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatRoi(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

export function formatProfitLoss(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${formatCredits(value)}`
}
