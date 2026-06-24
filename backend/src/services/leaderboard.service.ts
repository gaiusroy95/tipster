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
      orderBy: [{ rank: 'asc' }, { points: 'desc' }],
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
      if (sort === 'rank') return a.rank - b.rank;
      return b.points - a.points || a.rank - b.rank;
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

  /** Enroll a user in the active season; full rank recompute runs in the background. */
  async enrollUserInActiveSeason(userId: string) {
    const activeSeason = await seasonService.getActiveSeason();
    if (!activeSeason) return;

    await this.ensureParticipant(userId, activeSeason.id);

    const participantCount = await prisma.seasonParticipant.count({
      where: { seasonId: activeSeason.id },
    });

    await prisma.seasonParticipant.update({
      where: { userId_seasonId: { userId, seasonId: activeSeason.id } },
      data: { rank: participantCount },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { rank: participantCount },
    });

    void this.recomputeRanks(activeSeason.id).catch((error) => {
      console.error('[leaderboard] background rank recompute failed:', error);
    });
  },

  /** Backfill every registered user into the active season (startup / deploy). */
  async syncAllUsersToActiveSeason() {
    const activeSeason = await seasonService.getActiveSeason();
    if (!activeSeason) return;

    const users = await prisma.user.findMany({ select: { id: true } });
    if (users.length === 0) return;

    await prisma.seasonParticipant.createMany({
      data: users.map((u) => ({ userId: u.id, seasonId: activeSeason.id })),
      skipDuplicates: true,
    });

    await this.recomputeRanks(activeSeason.id);
    console.log(
      `[leaderboard] Synced ${users.length} user(s) to season "${activeSeason.name}"`,
    );
  },

  async countActiveSeasonParticipants() {
    const activeSeason = await seasonService.getActiveSeason();
    if (!activeSeason) return 0;
    return prisma.seasonParticipant.count({ where: { seasonId: activeSeason.id } });
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

  async recordBetSettled(
    userId: string,
    seasonId: string,
    outcome: 'won' | 'lost' | 'void',
    profitLossDelta: number,
  ) {
    const participant = await this.ensureParticipant(userId, seasonId);

    const wins = participant.wins + (outcome === 'won' ? 1 : 0);
    const losses = participant.losses + (outcome === 'lost' ? 1 : 0);
    const voids = participant.voids + (outcome === 'void' ? 1 : 0);
    const settledCount = wins + losses;
    const winRate =
      settledCount > 0
        ? Math.round((wins / settledCount) * 1000) / 10
        : participant.winRate;
    const profitLoss = participant.profitLoss + profitLossDelta;
    const points = Math.max(0, participant.points + profitLossDelta);
    const formLetter = outcome === 'won' ? 'W' : outcome === 'lost' ? 'L' : 'V';
    const form = [formLetter, ...participant.form].slice(0, 5);

    await prisma.seasonParticipant.update({
      where: { userId_seasonId: { userId, seasonId } },
      data: {
        wins,
        losses,
        voids,
        winRate,
        profitLoss,
        points,
        form,
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
    const activeSeason = await seasonService.getActiveSeason();
    const isActiveSeason = activeSeason?.id === seasonId;

    await prisma.$executeRaw`
      WITH ranked AS (
        SELECT
          sp.id AS participant_id,
          ROW_NUMBER() OVER (
            ORDER BY sp.points DESC, sp."profitLoss" DESC, u."createdAt" ASC
          )::int AS new_rank
        FROM "SeasonParticipant" sp
        INNER JOIN "User" u ON u.id = sp."userId"
        WHERE sp."seasonId" = ${seasonId}
      )
      UPDATE "SeasonParticipant" sp
      SET rank = ranked.new_rank
      FROM ranked
      WHERE sp.id = ranked.participant_id
    `;

    if (isActiveSeason) {
      await prisma.$executeRaw`
        WITH ranked AS (
          SELECT
            sp."userId" AS user_id,
            ROW_NUMBER() OVER (
              ORDER BY sp.points DESC, sp."profitLoss" DESC, u."createdAt" ASC
            )::int AS new_rank
          FROM "SeasonParticipant" sp
          INNER JOIN "User" u ON u.id = sp."userId"
          WHERE sp."seasonId" = ${seasonId}
        )
        UPDATE "User" u
        SET rank = ranked.new_rank
        FROM ranked
        WHERE u.id = ranked.user_id
      `;
    }
  },

  async getParticipant(userId: string, seasonId: string) {
    return prisma.seasonParticipant.findUnique({
      where: { userId_seasonId: { userId, seasonId } },
    });
  },
};
