import { formatMatchDate } from '@/shared/utils/formatDate'

export function parseSeasonDate(date: string): number {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return Date.now()
  return parsed.getTime()
}

export function getSeasonProgress(startDate: string, endDate: string): number {
  const start = parseSeasonDate(startDate)
  const end = parseSeasonDate(endDate)
  const now = Date.now()
  if (end <= start) return 0
  if (now <= start) return 0
  if (now >= end) return 100
  return Math.round(((now - start) / (end - start)) * 100)
}

export function getDaysRemaining(endDate: string): number {
  const end = parseSeasonDate(endDate)
  return Math.max(0, Math.ceil((end - Date.now()) / 86400000))
}

export function formatSeasonDateRange(startDate: string, endDate: string): string {
  return `${formatMatchDate(startDate)} — ${formatMatchDate(endDate)}`
}
