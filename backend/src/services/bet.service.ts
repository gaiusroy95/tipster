import { prisma } from '../lib/prisma';
import { ApiException } from '../lib/api-exception';
import {
  BETTING_RULES,
  calculateCancellationPenalty,
  computePotentialReturn,
  getBetSize,
  utcDateKey,
} from '../constants/betting.constants';
import {
  resolveBetSelection,
  isMatchFinished,
} from '../lib/bet-selection-resolver';
import { sportsService } from './sports.service';
import { toBetDto } from '../mappers/bet.mapper';
import { seasonService } from './season.service';
import { leaderboardService } from './leaderboard.service';
import { notificationService } from './notification.service';
import { achievementService } from './achievement.service';

export const betService = {
  async listBets(userId: string, status?: string) {
    const bets = await prisma.bet.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
      },
      orderBy: { placedAt: 'desc' },
    });
    return bets.map(toBetDto);
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

    const resolved = await resolveBetSelection(
      body.matchId,
      body.marketType,
      body.selectionId,
    );
    if (!resolved) {
      throw new ApiException('INVALID_SELECTION', 'Invalid market selection', 400);
    }

    const potentialReturn = computePotentialReturn(
      body.stake,
      resolved.odds,
      body.marketType,
    );

    const activeSeason = await seasonService.getActiveSeason();

    const bet = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: body.stake } },
      });

      const createdBet = await tx.bet.create({
        data: {
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
          homeTeamName: resolved.homeTeamName,
          awayTeamName: resolved.awayTeamName,
          leagueName: resolved.leagueName,
          matchStartTime: resolved.matchStartTime,
          sportId: resolved.sportId,
        },
      });

      await tx.walletTransaction.create({
        data: {
          userId,
          betId: createdBet.id,
          type: 'bet_placed',
          amount: -body.stake,
          balanceAfter: updatedUser.balance,
          description: `Bet placed on ${resolved.selectionLabel}`,
        },
      });

      await tx.dailyBetUsage.upsert({
        where: { userId_date: { userId, date: dateKey } },
        create: { userId, date: dateKey, count: 1 },
        update: { count: { increment: 1 } },
      });

      return createdBet;
    });

    if (activeSeason) {
      await leaderboardService.recordBetPlaced(userId, activeSeason.id);
      await leaderboardService.recomputeRanks(activeSeason.id);
    }

    await notificationService.create({
      userId,
      type: 'bet_result',
      title: 'Bet placed successfully',
      message: `Your bet on ${resolved.selectionLabel} is now active.`,
      link: '/bets/active',
      data: { betId: bet.id },
    });

    await achievementService.syncUserAchievements(userId);

    return toBetDto(bet);
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
      await leaderboardService.recomputeRanks(activeSeason.id);
    }

    await achievementService.syncUserAchievements(userId);

    return toBetDto(updatedBet);
  },
};
