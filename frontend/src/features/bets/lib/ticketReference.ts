/** Mirrors backend ticket format for MSW mocks. */
export function generateTicketReference(username: string, placedAt: Date = new Date()): string {
  const user = username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 16)
    .toUpperCase() || 'PLAYER'
  const y = placedAt.getUTCFullYear()
  const m = String(placedAt.getUTCMonth() + 1).padStart(2, '0')
  const d = String(placedAt.getUTCDate()).padStart(2, '0')
  const h = String(placedAt.getUTCHours()).padStart(2, '0')
  const min = String(placedAt.getUTCMinutes()).padStart(2, '0')
  const suffix = Math.random().toString(16).slice(2, 6).toUpperCase()
  return `TA-${user}-${y}${m}${d}-${h}${min}-${suffix}`
}
