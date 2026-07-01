import type { Bet } from '@prisma/client';
import type { Market } from '../types/overtime';
import { ApiException } from './api-exception';
import { isMatchFinished } from './bet-selection-resolver';

export type BetMatchStatus = 'scheduled' | 'live' | 'finished';

export function resolveBetMatchStatus(market: Market | null | undefined): BetMatchStatus {
  if (!market) return 'scheduled';
  if (isMatchFinished(market)) return 'finished';
  if (market.statusCode === 'ongoing') return 'live';
  return 'scheduled';
}

export function isBetCancellable(
  bet: Pick<Bet, 'status' | 'matchStartTime'>,
  market?: Market | null,
): boolean {
  if (bet.status !== 'active') return false;

  if (market) {
    if (isMatchFinished(market)) return false;
    if (market.statusCode === 'ongoing') return false;
  }

  const now = Date.now();
  if (bet.matchStartTime && bet.matchStartTime.getTime() <= now) {
    return false;
  }

  return true;
}

export function assertBetCancellable(
  bet: Pick<Bet, 'status' | 'matchStartTime'>,
  market?: Market | null,
): void {
  if (!isBetCancellable(bet, market)) {
    throw new ApiException(
      'BET_NOT_CANCELLABLE',
      'This bet can no longer be cancelled — the match has started or finished',
      400,
    );
  }
}
