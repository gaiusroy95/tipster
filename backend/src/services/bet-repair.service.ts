import { prisma } from '../lib/prisma';
import { computePotentialReturn } from '../constants/betting.constants';
import {
  isMatchFinished,
  resolveBetSelectionFromMarket,
} from '../lib/bet-selection-resolver';
import { sportsService } from './sports.service';

const CLAMPED_MALAY_ABS = 1;
const ODDS_EPSILON = 0.001;

/** Detect odds stored during the ±1.00 Malay clamp bug. */
export function looksLikeClampedMalayOdds(odds: number): boolean {
  return Math.abs(Math.abs(odds) - CLAMPED_MALAY_ABS) < ODDS_EPSILON;
}

/**
 * Re-resolve active bets that still carry clamp-era ±1.00 odds from live market data.
 * Locks in corrected odds + potentialReturn before settlement.
 */
export async function repairClampedActiveBetOdds(): Promise<{
  repaired: number;
  skipped: number;
}> {
  const activeBets = await prisma.bet.findMany({
    where: { status: 'active' },
    orderBy: { placedAt: 'asc' },
  });

  if (activeBets.length === 0) {
    return { repaired: 0, skipped: 0 };
  }

  let repaired = 0;
  let skipped = 0;

  for (const bet of activeBets) {
    if (!looksLikeClampedMalayOdds(bet.odds)) {
      skipped++;
      continue;
    }

    const market = await sportsService.getMarketOrNull(10, bet.matchId);
    if (!market || isMatchFinished(market)) {
      skipped++;
      continue;
    }

    const resolved = resolveBetSelectionFromMarket(
      market,
      bet.marketType,
      bet.selectionId,
    );
    if (!resolved || looksLikeClampedMalayOdds(resolved.odds)) {
      skipped++;
      continue;
    }

    const potentialReturn = computePotentialReturn(
      bet.stake,
      resolved.odds,
      bet.marketType,
    );

    await prisma.bet.update({
      where: { id: bet.id },
      data: {
        odds: resolved.odds,
        potentialReturn,
      },
    });
    repaired++;
  }

  if (repaired > 0) {
    console.log(
      `[bet-repair] Corrected Malay odds/returns on ${repaired} active bet(s)`,
    );
  }

  return { repaired, skipped };
}

export const betRepairService = {
  repairClampedActiveBetOdds,
};
