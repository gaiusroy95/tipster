/** Slice of leaderboard rows centered on a user, for profile side panels. */
export function getLeaderboardPreview<T extends { userId: string }>(
  entries: T[],
  userId: string,
  limit = 20,
): T[] {
  if (entries.length === 0) return []
  if (entries.length <= limit) return entries

  const centerIndex = entries.findIndex((e) => e.userId === userId)
  if (centerIndex < 0) return entries.slice(0, limit)

  const half = Math.floor(limit / 2)
  const sliceStart = Math.max(0, Math.min(centerIndex - half, entries.length - limit))
  return entries.slice(sliceStart, sliceStart + limit)
}
