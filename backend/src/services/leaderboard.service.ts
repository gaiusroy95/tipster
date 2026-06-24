import { prisma } from '../lib/prisma';
import { toLeaderboardEntryDto } from '../mappers/app.mapper';
import { seasonService } from './season.service';

export const leaderboardService = {
  async getLeaderboard(options?: { search?: string; sort?: string }) {
    const activeSeason = await seasonService.getActiveSeason();
    if (!activeSeason) return [];

    const participants = await prisma.seasonParticipant.findMany({
      where: { seasonId: activeSeason.id },
      include: { user: true },
    });

    let entries = participants.map((p) => toLeaderboardEntryDto(p, p.user));

    const search = options?.search?.toLowerCase();
    if (search) {
      entries = entries.filter(
        (e) =>
          e.displayName.toLowerCase().includes(search) ||
          e.username.toLowerCase().includes(search),
      );
    }

    const sort = options?.sort ?? 'points';
    entries.sort((a, b) => {
      if (sort === 'roi') return b.roi - a.roi;
      if (sort === 'profitLoss') return b.profitLoss - a.profitLoss;
      if (sort === 'winRate') return b.winRate - a.winRate;
      return b.points - a.points;
    });

    return entries;
  },

  async ensureParticipant(userId: string, seasonId: string) {
    return prisma.seasonParticipant.upsert({
      where: { userId_seasonId: { userId, seasonId } },
      create: { userId, seasonId },
      update: {},
    });
  },

  async recordBetPlaced(userId: string, seasonId: string) {
    await this.ensureParticipant(userId, seasonId);
    await prisma.seasonParticipant.update({
      where: { userId_seasonId: { userId, seasonId } },
      data: { totalBets: { increment: 1 } },
    });
  },

  async recordBetCancelled(
    userId: string,
    seasonId: string,
    penalty: number,
  ) {
    const participant = await this.ensureParticipant(userId, seasonId);
    const profitLoss = participant.profitLoss - penalty;
    const points = Math.max(0, participant.points - penalty);

    await prisma.seasonParticipant.update({
      where: { userId_seasonId: { userId, seasonId } },
      data: {
        profitLoss,
        points,
        roi: this.computeRoi(profitLoss, participant.totalBets),
      },
    });
  },

  computeRoi(profitLoss: number, totalBets: number): number {
    if (totalBets === 0) return 0;
    const base = totalBets * 25000;
    return Math.round((profitLoss / base) * 1000) / 10;
  },

  async recomputeRanks(seasonId: string) {
    const participants = await prisma.seasonParticipant.findMany({
      where: { seasonId },
      orderBy: [{ points: 'desc' }, { profitLoss: 'desc' }],
    });

    const activeSeason = await seasonService.getActiveSeason();
    const isActiveSeason = activeSeason?.id === seasonId;

    for (let i = 0; i < participants.length; i++) {
      const rank = i + 1;
      await prisma.seasonParticipant.update({
        where: { id: participants[i].id },
        data: { rank },
      });

      if (isActiveSeason) {
        await prisma.user.update({
          where: { id: participants[i].userId },
          data: { rank },
        });
      }
    }
  },

  async getParticipant(userId: string, seasonId: string) {
    return prisma.seasonParticipant.findUnique({
      where: { userId_seasonId: { userId, seasonId } },
    });
  },
};
