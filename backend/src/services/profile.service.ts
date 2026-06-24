import * as bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { ApiException } from '../lib/api-exception';
import { seasonService } from './season.service';
import { leaderboardService } from './leaderboard.service';
import { achievementService } from './achievement.service';
import { usersService } from './users.service';

const BCRYPT_ROUNDS = 12;

function buildOverallRankStats(
  currentRank: number,
  seasonPoints: number,
  totalPlayersCount: number,
): {
  current: number;
  best: number;
  totalPlayers: number;
  rankChange: number;
  seasonPoints: number;
  percentile: number;
  tierLabel: string;
  ranksToNextTier: number;
  nextTierLabel: string;
  tierProgressPercent: number;
} {
  const totalPlayers = Math.max(totalPlayersCount, 1);
  const percentile =
    currentRank > 0
      ? Math.round(((totalPlayers - currentRank) / totalPlayers) * 100)
      : 0;

  return {
    current: currentRank,
    best: currentRank,
    totalPlayers,
    rankChange: 0,
    seasonPoints,
    percentile,
    tierLabel: currentRank <= 10 ? 'Elite' : currentRank <= 100 ? 'Pro' : 'Rising',
    ranksToNextTier: currentRank > 10 ? currentRank - 10 : 0,
    nextTierLabel: currentRank <= 10 ? 'Elite' : 'Pro',
    tierProgressPercent: currentRank > 0 ? Math.min(100, Math.round((100 / currentRank) * 10)) : 0,
  };
}

export const profileService = {
  async updateProfile(
    userId: string,
    body: {
      displayName?: string;
      username?: string;
      avatarUrl?: string | null;
      country?: string;
      signature?: string;
      signatureLink?: string;
      signatureMode?: string;
    },
  ) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (body.username && body.username !== user.username) {
      const existing = await prisma.user.findUnique({
        where: { username: body.username },
      });
      if (existing) {
        throw new ApiException('USERNAME_EXISTS', 'Username is already taken', 409);
      }
    }

    const postCount = user.postCount;
    if (body.signature && postCount < 30) {
      throw new ApiException(
        'SIGNATURE_LOCKED',
        'Signatures require at least 30 posts',
        403,
      );
    }
    if (body.signatureLink && postCount < 30) {
      throw new ApiException(
        'SIGNATURE_LOCKED',
        'Signatures require at least 30 posts',
        403,
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.displayName !== undefined ? { displayName: body.displayName } : {}),
        ...(body.username !== undefined ? { username: body.username } : {}),
        ...(body.avatarUrl !== undefined
          ? { avatarUrl: body.avatarUrl }
          : {}),
        ...(body.country !== undefined ? { country: body.country } : {}),
        ...(body.signature !== undefined
          ? { signature: body.signature || null }
          : {}),
        ...(body.signatureLink !== undefined
          ? { signatureLink: body.signatureLink || null }
          : {}),
        ...(body.signatureMode !== undefined
          ? { signatureMode: body.signatureMode }
          : {}),
      },
    });

    await achievementService.syncUserAchievements(userId);

    return updated;
  },

  async changePassword(
    userId: string,
    body: { currentPassword: string; newPassword: string },
  ) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (!user.passwordHash) {
      throw new ApiException(
        'NO_PASSWORD',
        'Set a password first or sign in with your linked provider',
        400,
      );
    }

    const valid = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!valid) {
      throw new ApiException('INVALID_PASSWORD', 'Current password is incorrect', 401);
    }

    if (body.currentPassword === body.newPassword) {
      throw new ApiException(
        'VALIDATION',
        'New password must differ from current password',
        400,
      );
    }

    const passwordHash = await bcrypt.hash(body.newPassword, BCRYPT_ROUNDS);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password updated successfully' };
  },

  async changeEmail(
    userId: string,
    body: { email: string; password: string },
  ) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (!user.passwordHash) {
      throw new ApiException(
        'NO_PASSWORD',
        'Set a password first or sign in with your linked provider',
        400,
      );
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      throw new ApiException('INVALID_PASSWORD', 'Password is incorrect', 401);
    }

    const email = body.email.toLowerCase();
    if (email === user.email) {
      return user;
    }

    const existing = await usersService.findByEmail(email);
    if (existing && existing.id !== userId) {
      throw new ApiException('EMAIL_EXISTS', 'Email is already in use', 409);
    }

    return prisma.user.update({
      where: { id: userId },
      data: { email },
    });
  },

  async getProfileStats(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    const userBets = await prisma.bet.findMany({
      where: { userId },
      orderBy: { placedAt: 'desc' },
    });

    const settled = userBets.filter(
      (b) => b.status === 'won' || b.status === 'lost',
    );
    const wins = settled.filter((b) => b.status === 'won').length;
    const losses = settled.filter((b) => b.status === 'lost').length;
    const activeBets = userBets.filter((b) => b.status === 'active').length;

    const activeSeason = await seasonService.getActiveSeason();
    const participant = activeSeason
      ? await leaderboardService.getParticipant(userId, activeSeason.id)
      : null;

    const currentRank = participant?.rank ?? user.rank;
    const seasonPoints = participant?.points ?? 0;
    const form = (participant?.form ?? []).slice(0, 5) as ('W' | 'L' | 'D')[];

    const stakes = userBets.map((b) => b.stake);
    const avgStake =
      stakes.length > 0
        ? Math.round(stakes.reduce((a, b) => a + b, 0) / stakes.length)
        : 0;

    const winAmounts = userBets
      .filter((b) => b.status === 'won' && b.profitLoss != null)
      .map((b) => b.profitLoss!);
    const lossAmounts = userBets
      .filter((b) => b.status === 'lost' && b.profitLoss != null)
      .map((b) => b.profitLoss!);

    const marketCounts: Record<string, number> = {};
    for (const bet of userBets) {
      marketCounts[bet.marketType] = (marketCounts[bet.marketType] ?? 0) + 1;
    }
    const favoriteMarket =
      Object.entries(marketCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      'winner';

    const leagueMap: Record<
      string,
      { leagueName: string; profitLoss: number; bets: number }
    > = {};
    for (const bet of userBets) {
      const key = bet.leagueName ?? 'Unknown';
      if (!leagueMap[key]) {
        leagueMap[key] = { leagueName: key, profitLoss: 0, bets: 0 };
      }
      leagueMap[key].bets += 1;
      leagueMap[key].profitLoss += bet.profitLoss ?? 0;
    }

    const achievements = await achievementService.getProfileAchievements(userId);
    const achievementProgress = await achievementService.getProgress(userId);
    const totalPlayers = await leaderboardService.countActiveSeasonParticipants();

    return {
      userId,
      displayName: user.displayName,
      username: user.username,
      avatarUrl: user.avatarUrl ?? undefined,
      rank: currentRank,
      balance: user.balance,
      overallRank: buildOverallRankStats(currentRank, seasonPoints, totalPlayers),
      seasonStats: {
        points: participant?.points ?? 0,
        roi: participant?.roi ?? 0,
        profitLoss: participant?.profitLoss ?? 0,
        winRate: participant?.winRate ?? 0,
        totalBets: participant?.totalBets ?? userBets.length,
        wins,
        losses,
        activeBets,
      },
      bettingStats: {
        avgStake,
        biggestWin: winAmounts.length ? Math.max(...winAmounts) : 0,
        biggestLoss: lossAmounts.length ? Math.min(...lossAmounts) : 0,
        favoriteMarket,
      },
      form,
      leaguePerformance: Object.entries(leagueMap).map(([leagueId, v]) => ({
        leagueId,
        leagueName: v.leagueName,
        profitLoss: v.profitLoss,
        bets: v.bets,
      })),
      performanceHistory: [],
      achievements,
      achievementProgress,
    };
  },
};
