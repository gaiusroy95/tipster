export interface GameScore {
  homeScore: number;
  awayScore: number;
  updatedAt: number;
}

const scores = new Map<string, GameScore>();

export function cacheGameScore(
  gameId: string,
  homeScore: number,
  awayScore: number,
): void {
  if (!gameId) return;
  if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore)) return;

  scores.set(gameId, {
    homeScore,
    awayScore,
    updatedAt: Date.now(),
  });
}

export function getCachedGameScore(gameId: string): GameScore | null {
  return scores.get(gameId) ?? null;
}

export function cacheGameScoresFromLiveMarkets(
  markets: Array<{ gameId?: string; homeScore?: number; awayScore?: number }>,
): void {
  for (const market of markets) {
    if (!market.gameId) continue;
    if (market.homeScore == null || market.awayScore == null) continue;
    cacheGameScore(market.gameId, market.homeScore, market.awayScore);
  }
}
