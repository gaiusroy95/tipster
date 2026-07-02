import { prisma } from '../lib/prisma';
import { ApiException } from '../lib/api-exception';
import { isOutdatedBetSchemaError, toBetPlacementApiException } from '../lib/prisma-errors';
import {
  BETTING_RULES,
  calculateCancellationPenalty,
  computePotentialReturn,
  getBetSize,
  utcDateKey,
} from '../constants/betting.constants';
import {
  resolveBetSelectionFromMarket,
  isMatchFinished,
} from '../lib/bet-selection-resolver';
import { assertBetCancellable } from '../lib/bet-cancellability';
import { sportsService } from './sports.service';
import { toBetDto } from '../mappers/bet.mapper';
import { seasonService } from './season.service';
import { marketTypeConfigService } from './admin/market-type-config.service';
import { leaderboardService } from './leaderboard.service';
import { notificationService } from './notification.service';
import { achievementService } from './achievement.service';
import { generateTicketReference } from '../lib/ticket-reference';

const IDEMPOTENT_BET_WINDOW_MS = 2 * 60 * 1000;

async function runPostBetPlacementEffects(
  userId: string,
  betId: string,
  seasonId: string | undefined,
  selectionLabel: string,
): Promise<void> {
  if (seasonId) {
    await leaderboardService.recordBetPlaced(userId, seasonId);
    void leaderboardService.recomputeRanks(seasonId).catch((error) => {
      console.error('[bet] background rank recompute failed:', error);
    });
  }

  await notificationService.create({
    userId,
    type: 'bet_result',
    title: 'Bet placed successfully',
    message: `Your bet on ${selectionLabel} is now active.`,
    link: '/bets/active',
    data: { betId },
  });

  await achievementService.syncUserAchievements(userId);
}

async function resolvePlacementSelection(body: {
  matchId: string;
  marketType: string;
  selectionId: string;
}) {
  const market = await sportsService.getMarketOrNull(10, body.matchId);
  if (!market) {
    throw new ApiException('NOT_FOUND', 'Match not found', 404);
  }
  if (isMatchFinished(market)) {
    throw new ApiException(
      'MATCH_FINISHED',
      'Cannot bet on finished match',
      400,
    );
  }

  const marketEnabled = await marketTypeConfigService.isEnabled(body.marketType);
  if (!marketEnabled) {
    throw new ApiException(
      'MARKET_DISABLED',
      'This market type is not available for betting',
      400,
    );
  }

  const resolved = resolveBetSelectionFromMarket(
    market,
    body.marketType,
    body.selectionId,
  );
  if (!resolved) {
    throw new ApiException('INVALID_SELECTION', 'Invalid market selection', 400);
  }

  return { market, resolved };
}

export const betService = {
  async getDailyBetUsage(userId: string) {
    const dateKey = utcDateKey();
    const usage = await prisma.dailyBetUsage.findUnique({
      where: { userId_date: { userId, date: dateKey } },
    });
    const betsUsed = usage?.count ?? 0;
    const bigBetsUsed = usage?.bigCount ?? 0;
    const tomorrow = new Date(`${dateKey}T00:00:00.000Z`);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    return {
      betsUsed,
      betsLimit: BETTING_RULES.dailyBetLimit,
      bigBetsUsed,
      bigBetsLimit: BETTING_RULES.dailyBigBetLimit,
      resetsAt: tomorrow.toISOString(),
    };
  },

  async listBets(userId: string, status?: string) {
    const bets = await prisma.bet.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
      },
      orderBy: { placedAt: 'desc' },
    });

    const activeMatchIds = [
      ...new Set(
        bets.filter((b) => b.status === 'active').map((b) => b.matchId),
      ),
    ];

    const markets = new Map<string, Awaited<ReturnType<typeof sportsService.getMarketOrNull>>>();
    await Promise.all(
      activeMatchIds.map(async (matchId) => {
        const market = await sportsService.getMarketOrNull(10, matchId);
        markets.set(matchId, market);
      }),
    );

    return bets.map((bet) =>
      toBetDto(bet, bet.status === 'active' ? markets.get(bet.matchId) : null),
    );
  },

  async listPublicBets(userId: string, status?: string) {
    return this.listBets(userId, status);
  },

  async placeBet(
    userId: string,
    body: {
      matchId: string;
      marketType: string;
      selectionId: string;
      stake: number;
    },
  ) {
    try {
      return await this.placeBetInternal(userId, body);
    } catch (error) {
      const mapped = toBetPlacementApiException(error);
      if (mapped) throw mapped;
      throw error;
    }
  },

  async placeBetInternal(
    userId: string,
    body: {
      matchId: string;
      marketType: string;
      selectionId: string;
      stake: number;
    },
  ) {
    const recentDuplicate = await prisma.bet.findFirst({
      where: {
        userId,
        matchId: body.matchId,
        selectionId: body.selectionId,
        stake: body.stake,
        status: 'active',
        placedAt: {
          gte: new Date(Date.now() - IDEMPOTENT_BET_WINDOW_MS),
        },
      },
      orderBy: { placedAt: 'desc' },
    });
    if (recentDuplicate) {
      return toBetDto(recentDuplicate);
    }

    const betSize = getBetSize(body.stake);
    if (!betSize) {
      throw new ApiException(
        'INVALID_STAKE',
        `Stake must be ${BETTING_RULES.standardStake.toLocaleString()} or ${BETTING_RULES.premiumStake.toLocaleString()} credits`,
        400,
      );
    }

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (body.stake > user.balance) {
      throw new ApiException(
        'INSUFFICIENT_BALANCE',
        'Insufficient virtual credits',
        400,
      );
    }

    const dateKey = utcDateKey();
    const dailyUsage = await prisma.dailyBetUsage.findUnique({
      where: { userId_date: { userId, date: dateKey } },
    });
    const dailyCount = dailyUsage?.count ?? 0;
    if (dailyCount >= BETTING_RULES.dailyBetLimit) {
      throw new ApiException(
        'DAILY_BET_LIMIT',
        `Daily bet limit (${BETTING_RULES.dailyBetLimit}) reached`,
        400,
      );
    }

    const bigBetCount = dailyUsage?.bigCount ?? 0;
    if (betSize === 'big' && bigBetCount >= BETTING_RULES.dailyBigBetLimit) {
      throw new ApiException(
        'DAILY_BIG_BET_LIMIT',
        `Daily big bet limit (${BETTING_RULES.dailyBigBetLimit}) reached`,
        400,
      );
    }

    const { resolved } = await resolvePlacementSelection(body);

    const potentialReturn = computePotentialReturn(
      body.stake,
      resolved.odds,
      body.marketType,
    );

    const activeSeason = await seasonService.getActiveSeason();

    const placedAt = new Date();

    const bet = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: body.stake } },
      });

      let ticketReference = generateTicketReference(user.username, placedAt);
      let createdBet;
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          createdBet = await tx.bet.create({
            data: {
              ticketReference,
              userId,
              matchId: body.matchId,
              marketType: body.marketType,
              selectionId: body.selectionId,
              selectionLabel: resolved.selectionLabel,
              odds: resolved.odds,
              stake: body.stake,
              potentialReturn,
              betSize,
              status: 'active',
              placedAt,
              homeTeamName: resolved.homeTeamName,
              awayTeamName: resolved.awayTeamName,
              leagueName: resolved.leagueName,
              matchStartTime: resolved.matchStartTime,
              sportId: resolved.sportId,
            },
          });
          break;
        } catch (error) {
          const isDuplicate =
            error &&
            typeof error === 'object' &&
            'code' in error &&
            (error as { code?: string }).code === 'P2002';
          if (!isDuplicate || attempt === 4) throw error;
          ticketReference = generateTicketReference(user.username, placedAt);
        }
      }

      if (!createdBet) {
        throw new ApiException('INTERNAL_ERROR', 'Could not create bet ticket', 500);
      }

      await tx.walletTransaction.create({
        data: {
          userId,
          betId: createdBet.id,
          type: 'bet_placed',
          amount: -body.stake,
          balanceAfter: updatedUser.balance,
          description: `Bet placed · ${ticketReference} · ${resolved.selectionLabel}`,
        },
      });

      await tx.dailyBetUsage.upsert({
        where: { userId_date: { userId, date: dateKey } },
        create: {
          userId,
          date: dateKey,
          count: 1,
          bigCount: betSize === 'big' ? 1 : 0,
        },
        update: {
          count: { increment: 1 },
          ...(betSize === 'big' ? { bigCount: { increment: 1 } } : {}),
        },
      });

      return createdBet;
    });

    const betDto = toBetDto(bet);

    void runPostBetPlacementEffects(
      userId,
      bet.id,
      activeSeason?.id,
      resolved.selectionLabel,
    ).catch((error) => {
      console.error('[bet] post-placement effects failed:', error);
    });

    return betDto;
  },

  async previewBetPlacement(body: {
    matchId: string;
    marketType: string;
    selectionId: string;
    stake: number;
  }) {
    const { resolved } = await resolvePlacementSelection(body);

    const potentialReturn = computePotentialReturn(
      body.stake,
      resolved.odds,
      body.marketType,
    );

    return {
      odds: resolved.odds,
      potentialReturn,
      selectionLabel: resolved.selectionLabel,
    };
  },

  async cancelBet(userId: string, betId: string) {
    const bet = await prisma.bet.findFirst({
      where: { id: betId, userId },
    });
    if (!bet) {
      throw new ApiException('NOT_FOUND', 'Bet not found', 404);
    }
    if (bet.status !== 'active') {
      throw new ApiException(
        'BET_NOT_ACTIVE',
        'Only active bets can be cancelled',
        400,
      );
    }

    const market = await sportsService.getMarketOrNull(10, bet.matchId);
    assertBetCancellable(bet, market);

    const penalty = calculateCancellationPenalty(bet.stake);
    const refund = bet.stake - penalty;
    const activeSeason = await seasonService.getActiveSeason();

    const updatedBet = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: refund } },
      });

      const cancelled = await tx.bet.update({
        where: { id: betId },
        data: {
          status: 'cancelled',
          settledAt: new Date(),
          profitLoss: -penalty,
        },
      });

      await tx.walletTransaction.create({
        data: {
          userId,
          betId: betId,
          type: 'bet_cancelled',
          amount: refund,
          balanceAfter: updatedUser.balance,
          description: `Bet cancelled (penalty: ${penalty} credits)`,
        },
      });

      if (penalty > 0) {
        await tx.walletTransaction.create({
          data: {
            userId,
            betId: betId,
            type: 'penalty',
            amount: -penalty,
            balanceAfter: updatedUser.balance,
            description: 'Cancellation penalty',
          },
        });
      }

      return cancelled;
    });

    if (activeSeason) {
      await leaderboardService.recordBetCancelled(
        userId,
        activeSeason.id,
        penalty,
      );
      void leaderboardService.recomputeRanks(activeSeason.id).catch((error) => {
        console.error('[bet] background rank recompute failed:', error);
      });
    }

    void achievementService.syncUserAchievements(userId).catch((error) => {
      console.error('[bet] achievement sync failed:', error);
    });

    return toBetDto(updatedBet, market);
  },
};
