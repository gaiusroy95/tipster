import { prisma } from '../lib/prisma';
import { toWalletTransactionDto } from '../mappers/wallet.mapper';
import { seasonService } from './season.service';
import { leaderboardService } from './leaderboard.service';
import { forumService } from './forum.service';

export const dashboardService = {
  async getDashboard(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const activeBetsCount = await prisma.bet.count({
      where: { userId, status: 'active' },
    });

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const todayBets = await prisma.bet.findMany({
      where: {
        userId,
        settledAt: { gte: todayStart },
        status: { in: ['won', 'lost', 'cancelled'] },
      },
    });
    const todayProfitLoss = todayBets.reduce(
      (sum, b) => sum + (b.profitLoss ?? 0),
      0,
    );

    const recentTransactions = await prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const activeSeason = await seasonService.getActiveSeason();
    let form: string[] = [];
    if (activeSeason) {
      const participant = await leaderboardService.getParticipant(
        userId,
        activeSeason.id,
      );
      form = participant?.form.slice(0, 5) ?? [];
    }

    const forumStats = await forumService.getUserForumStats(userId);

    return {
      balance: user.balance,
      rank: user.rank,
      activeBetsCount,
      todayProfitLoss,
      recentActivity: recentTransactions.map(toWalletTransactionDto),
      form,
      ...forumStats,
    };
  },
};
