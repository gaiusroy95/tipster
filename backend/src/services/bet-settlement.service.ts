import type { Bet } from '@prisma/client';
import { prisma } from '../lib/prisma';
import {
  evaluateBetOutcome,
  parseSelectionId,
  type BetOutcome,
} from '../lib/bet-outcome.evaluator';
import { cacheGameScore, getCachedGameScore } from '../lib/game-score-cache';
import { fetchGameScoresWithRetry } from '../api/overtime';
import type { Market } from '../types/overtime';
import { sportsService } from './sports.service';
import { seasonService } from './season.service';
import { leaderboardService } from './leaderboard.service';
import { notificationService } from './notification.service';
import { achievementService } from './achievement.service';

function outcomeStatus(outcome: BetOutcome): 'won' | 'lost' | 'void' {
  return outcome;
}

function profitLossForOutcome(
  bet: Bet,
  outcome: BetOutcome,
): number {
  if (outcome === 'won') return bet.potentialReturn - bet.stake;
  if (outcome === 'lost') return -bet.stake;
  return 0;
}

function walletCreditForOutcome(bet: Bet, outcome: BetOutcome): number {
  if (outcome === 'won') return bet.potentialReturn;
  if (outcome === 'void') return bet.stake;
  return 0;
}

async function settleSingleBet(
  bet: Bet,
  outcome: BetOutcome,
  activeSeasonId: string | null,
): Promise<void> {
  const status = outcomeStatus(outcome);
  const profitLoss = profitLossForOutcome(bet, outcome);
  const credit = walletCreditForOutcome(bet, outcome);

  await prisma.$transaction(async (tx) => {
    let balanceAfter: number | null = null;

    if (credit > 0) {
      const updatedUser = await tx.user.update({
        where: { id: bet.userId },
        data: { balance: { increment: credit } },
      });
      balanceAfter = updatedUser.balance;

      await tx.walletTransaction.create({
        data: {
          userId: bet.userId,
          betId: bet.id,
          type: outcome === 'won' ? 'bet_won' : 'bet_cancelled',
          amount: credit,
          balanceAfter,
          description:
            outcome === 'won'
              ? `Bet won — ${bet.selectionLabel}`
              : `Bet voided — stake refunded (${bet.selectionLabel})`,
        },
      });
    }

    await tx.bet.update({
      where: { id: bet.id },
      data: {
        status,
        profitLoss,
        settledAt: new Date(),
      },
    });
  });

  if (activeSeasonId) {
    await leaderboardService.recordBetSettled(
      bet.userId,
      activeSeasonId,
      outcome,
      profitLoss,
    );
  }

  const title =
    outcome === 'won'
      ? 'Bet won!'
      : outcome === 'lost'
        ? 'Bet lost'
        : 'Bet voided';

  const message =
    outcome === 'won'
      ? `Your bet on ${bet.selectionLabel} won ${profitLoss.toLocaleString()} credits.`
      : outcome === 'lost'
        ? `Your bet on ${bet.selectionLabel} did not come through.`
        : `Your bet on ${bet.selectionLabel} was voided and your stake was refunded.`;

  await notificationService.create({
    userId: bet.userId,
    type: 'bet_result',
    title,
    message,
    link: outcome === 'won' || outcome === 'lost' ? '/bets/history' : '/bets/active',
    data: { betId: bet.id, outcome },
  });

  await achievementService.syncUserAchievements(bet.userId);
}

function isMarketResolved(market: Market): boolean {
  return market.isResolved || market.statusCode === 'resolved' || market.status === 10;
}

async function resolveMarketForSettlement(matchId: string): Promise<Market | null> {
  const live = await sportsService.getMarketOrNull(10, matchId);
  if (live) return live;

  const archived = sportsService.finishedMarketsCache.get(matchId);
  return archived ?? null;
}

async function resolveScoresForMatch(matchId: string): Promise<{
  homeScore: number;
  awayScore: number;
} | null> {
  const cached = getCachedGameScore(matchId);
  if (cached) {
    return { homeScore: cached.homeScore, awayScore: cached.awayScore };
  }

  const archived = sportsService.finishedMarketsCache.get(matchId) as
    | { homeScore?: number; awayScore?: number }
    | undefined;
  if (
    archived &&
    archived.homeScore != null &&
    archived.awayScore != null &&
    Number.isFinite(archived.homeScore) &&
    Number.isFinite(archived.awayScore)
  ) {
    return { homeScore: archived.homeScore, awayScore: archived.awayScore };
  }

  const fetched = await fetchGameScoresWithRetry(matchId);
  if (fetched) {
    cacheGameScore(matchId, fetched.homeScore, fetched.awayScore);
    return fetched;
  }

  return null;
}

async function settleBetsForMatch(
  matchId: string,
  bets: Bet[],
  activeSeasonId: string | null,
): Promise<number> {
  const market = await resolveMarketForSettlement(matchId);
  if (!market) return 0;

  if (market.isCancelled || market.statusCode === 'cancelled') {
    let settled = 0;
    for (const bet of bets) {
      await settleSingleBet(bet, 'void', activeSeasonId);
      settled++;
    }
    return settled;
  }

  if (!isMarketResolved(market)) {
    return 0;
  }

  const scores = await resolveScoresForMatch(matchId);
  if (!scores) {
    console.warn(
      `[bet-settlement] No scores for resolved match ${matchId}; skipping ${bets.length} bet(s)`,
    );
    return 0;
  }

  const threeWayWinner = (market.odds?.length ?? 0) >= 3;
  let settled = 0;

  for (const bet of bets) {
    const parsed = parseSelectionId(bet.selectionId);
    if (!parsed || parsed.marketType !== bet.marketType) {
      console.warn(
        `[bet-settlement] Invalid selection ${bet.selectionId} for bet ${bet.id}; voiding`,
      );
      await settleSingleBet(bet, 'void', activeSeasonId);
      settled++;
      continue;
    }

    const outcome = evaluateBetOutcome({
      marketType: parsed.marketType,
      selectionIndex: parsed.selectionIndex,
      line: parsed.line,
      homeScore: scores.homeScore,
      awayScore: scores.awayScore,
      threeWayWinner,
    });

    await settleSingleBet(bet, outcome, activeSeasonId);
    settled++;
  }

  return settled;
}

export const betSettlementService = {
  async settlePendingBets(): Promise<{ settled: number; skipped: number }> {
    const activeBets = await prisma.bet.findMany({
      where: { status: 'active' },
      orderBy: { placedAt: 'asc' },
    });

    if (activeBets.length === 0) {
      return { settled: 0, skipped: 0 };
    }

    const activeSeason = await seasonService.getActiveSeason();
    const activeSeasonId = activeSeason?.id ?? null;

    const betsByMatch = new Map<string, Bet[]>();
    for (const bet of activeBets) {
      const list = betsByMatch.get(bet.matchId) ?? [];
      list.push(bet);
      betsByMatch.set(bet.matchId, list);
    }

    let settled = 0;
    let skipped = 0;

    for (const [matchId, bets] of betsByMatch) {
      const count = await settleBetsForMatch(matchId, bets, activeSeasonId);
      settled += count;
      skipped += bets.length - count;
    }

    if (settled > 0 && activeSeasonId) {
      await leaderboardService.recomputeRanks(activeSeasonId);
    }

    if (settled > 0) {
      console.log(`[bet-settlement] Settled ${settled} bet(s)`);
    }

    return { settled, skipped };
  },

  async settleBetsForMatches(matchIds: string[]): Promise<void> {
    if (matchIds.length === 0) return;

    const activeSeason = await seasonService.getActiveSeason();
    const activeSeasonId = activeSeason?.id ?? null;

    let settled = 0;

    for (const matchId of matchIds) {
      const bets = await prisma.bet.findMany({
        where: { matchId, status: 'active' },
      });
      if (bets.length === 0) continue;
      settled += await settleBetsForMatch(matchId, bets, activeSeasonId);
    }

    if (settled > 0 && activeSeasonId) {
      await leaderboardService.recomputeRanks(activeSeasonId);
    }
  },
};
