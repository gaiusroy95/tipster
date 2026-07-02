import type { Bet, User } from '@prisma/client';
import { prisma } from '../lib/prisma';
import {
  ACHIEVEMENT_CATALOG,
  type AchievementDefinition,
} from '../constants/achievement.constants';
import { BETTING_RULES } from '../constants/betting.constants';

export interface AchievementProgressDto {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  iconSlug: string;
  earned: boolean;
  earnedAt?: string;
  progress?: { current: number; target: number };
  requiresSettlement?: boolean;
}

type CheckResult = {
  earned: boolean;
  progress?: { current: number; target: number };
};

const ALL_MARKETS = ['malay', 'winner', 'handicap', 'over_under'];

function placedBets(bets: Bet[]) {
  return bets.filter((b) => b.status !== 'cancelled');
}

function cancelledCount(bets: Bet[]) {
  return bets.filter((b) => b.status === 'cancelled').length;
}

function uniqueMarkets(bets: Bet[]) {
  return new Set(placedBets(bets).map((b) => b.marketType));
}

function maxBetsOnAnyDay(bets: Bet[]) {
  const byDay: Record<string, number> = {};
  for (const bet of bets) {
    const day = bet.placedAt.toISOString().slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + 1;
  }
  return Math.max(0, ...Object.values(byDay));
}

function maxWinStreak(bets: Bet[]) {
  const settled = bets
    .filter((b) => b.status === 'won' || b.status === 'lost')
    .sort((a, b) => {
      const aTime = a.settledAt ?? a.placedAt;
      const bTime = b.settledAt ?? b.placedAt;
      return aTime.getTime() - bTime.getTime();
    });

  let streak = 0;
  let max = 0;
  for (const bet of settled) {
    if (bet.status === 'won') {
      streak += 1;
      max = Math.max(max, streak);
    } else {
      streak = 0;
    }
  }
  return max;
}

function checkAchievement(
  def: AchievementDefinition,
  ctx: {
    user: User;
    bets: Bet[];
    todayBetCount: number;
    showProfilePublic: boolean;
    socialLinkCount: number;
  },
): CheckResult {
  const placed = placedBets(ctx.bets);
  const totalPlaced = placed.length;
  const markets = uniqueMarkets(ctx.bets);
  const cancelled = cancelledCount(ctx.bets);
  const winStreak = maxWinStreak(ctx.bets);
  const wins = ctx.bets.filter((b) => b.status === 'won').length;

  switch (def.id) {
    case 'first-bet':
      return {
        earned: totalPlaced >= 1,
        progress: { current: Math.min(totalPlaced, 1), target: 1 },
      };
    case 'big-game': {
      const big = placed.some(
        (b) => b.stake === BETTING_RULES.premiumStake || b.betSize === 'big',
      );
      return { earned: big, progress: { current: big ? 1 : 0, target: 1 } };
    }
    case 'daily-limit': {
      const dayMax = Math.max(ctx.todayBetCount, maxBetsOnAnyDay(ctx.bets));
      return {
        earned: dayMax >= BETTING_RULES.dailyBetLimit,
        progress: {
          current: Math.min(dayMax, BETTING_RULES.dailyBetLimit),
          target: BETTING_RULES.dailyBetLimit,
        },
      };
    }
    case 'on-the-board': {
      const active = ctx.bets.some((b) => b.status === 'active');
      return { earned: active, progress: { current: active ? 1 : 0, target: 1 } };
    }
    case 'first-malay': {
      const malay = placed.some(
        (b) =>
          b.marketType === 'malay' ||
          b.marketType === 'winner' ||
          b.marketType === 'handicap' ||
          b.marketType === 'over_under',
      );
      return { earned: malay, progress: { current: malay ? 1 : 0, target: 1 } };
    }
    case 'first-handicap': {
      const handicap = placed.some((b) => b.marketType === 'handicap');
      return { earned: handicap, progress: { current: handicap ? 1 : 0, target: 1 } };
    }
    case 'first-over-under': {
      const ou = placed.some((b) => b.marketType === 'over_under');
      return { earned: ou, progress: { current: ou ? 1 : 0, target: 1 } };
    }
    case 'first-winner': {
      const winner = placed.some((b) => b.marketType === 'winner');
      return { earned: winner, progress: { current: winner ? 1 : 0, target: 1 } };
    }
    case 'live-punter':
      return { earned: false, progress: { current: 0, target: 1 } };
    case 'cool-head': {
      const cooled = cancelled > 0;
      return { earned: cooled, progress: { current: cooled ? 1 : 0, target: 1 } };
    }
    case 'steady-hand':
      if (cancelled > 0) {
        return { earned: false, progress: { current: 0, target: 10 } };
      }
      return {
        earned: totalPlaced >= 10,
        progress: { current: Math.min(totalPlaced, 10), target: 10 },
      };
    case 'regular':
      return {
        earned: totalPlaced >= 10,
        progress: { current: Math.min(totalPlaced, 10), target: 10 },
      };
    case 'committed':
      return {
        earned: totalPlaced >= 25,
        progress: { current: Math.min(totalPlaced, 25), target: 25 },
      };
    case 'multi-market':
      return {
        earned: markets.size >= 2,
        progress: { current: Math.min(markets.size, 2), target: 2 },
      };
    case 'all-markets': {
      const allCount = ALL_MARKETS.filter((m) => markets.has(m)).length;
      return {
        earned: allCount >= ALL_MARKETS.length,
        progress: { current: allCount, target: ALL_MARKETS.length },
      };
    }
    case 'arena-debut':
      return { earned: true, progress: { current: 1, target: 1 } };
    case 'face-of-arena': {
      const avatar = Boolean(ctx.user.avatarUrl);
      return { earned: avatar, progress: { current: avatar ? 1 : 0, target: 1 } };
    }
    case 'transparent': {
      const publicProfile = ctx.showProfilePublic;
      return {
        earned: publicProfile,
        progress: { current: publicProfile ? 1 : 0, target: 1 },
      };
    }
    case 'connected': {
      const linked =
        ctx.socialLinkCount > 0 ||
        ctx.user.authProviders.some((p) => p !== 'email');
      return { earned: linked, progress: { current: linked ? 1 : 0, target: 1 } };
    }
    case 'ranked-500':
      return {
        earned: ctx.user.rank <= 500 && ctx.user.rank > 0,
        progress: {
          current: ctx.user.rank <= 500 && ctx.user.rank > 0 ? 1 : 0,
          target: 1,
        },
      };
    case 'ranked-100':
      return {
        earned: ctx.user.rank <= 100 && ctx.user.rank > 0,
        progress: {
          current: ctx.user.rank <= 100 && ctx.user.rank > 0 ? 1 : 0,
          target: 1,
        },
      };
    case 'ranked-10':
      return {
        earned: ctx.user.rank <= 10 && ctx.user.rank > 0,
        progress: {
          current: ctx.user.rank <= 10 && ctx.user.rank > 0 ? 1 : 0,
          target: 1,
        },
      };
    case 'first-win':
      return {
        earned: wins >= 1,
        progress: { current: Math.min(wins, 1), target: 1 },
      };
    case 'hot-streak':
      return {
        earned: winStreak >= 3,
        progress: { current: Math.min(winStreak, 3), target: 3 },
      };
    case 'on-fire':
      return {
        earned: winStreak >= 5,
        progress: { current: Math.min(winStreak, 5), target: 5 },
      };
    default:
      return { earned: false };
  }
}

export const achievementService = {
  async buildContext(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const bets = await prisma.bet.findMany({ where: { userId } });
    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    const socialLinkCount = await prisma.socialAccount.count({
      where: { userId },
    });
    const today = new Date().toISOString().slice(0, 10);
    const dailyUsage = await prisma.dailyBetUsage.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    return {
      user,
      bets,
      todayBetCount: dailyUsage?.count ?? 0,
      showProfilePublic: settings?.showProfilePublic ?? true,
      socialLinkCount,
    };
  },

  async syncUserAchievements(userId: string) {
    const ctx = await this.buildContext(userId);
    const existing = await prisma.userAchievement.findMany({
      where: { userId },
    });
    const earnedIds = new Set(existing.map((e) => e.achievementId));
    const now = new Date();
    const toCreate: { userId: string; achievementId: string; earnedAt: Date }[] = [];

    for (const def of ACHIEVEMENT_CATALOG) {
      if (earnedIds.has(def.id)) continue;
      const { earned } = checkAchievement(def, ctx);
      if (earned) {
        toCreate.push({ userId, achievementId: def.id, earnedAt: now });
        earnedIds.add(def.id);
      }
    }

    if (toCreate.length > 0) {
      await prisma.userAchievement.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
    }
  },

  async getProgress(userId: string): Promise<AchievementProgressDto[]> {
    await this.syncUserAchievements(userId);
    const ctx = await this.buildContext(userId);
    const earned = await prisma.userAchievement.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });
    const earnedMap = new Map(
      earned.map((e) => [e.achievementId, e.earnedAt.toISOString()]),
    );

    return ACHIEVEMENT_CATALOG.map((def) => {
      const earnedAt = earnedMap.get(def.id);
      const check = checkAchievement(def, ctx);
      const isEarned = earnedAt !== undefined || check.earned;

      const dto: AchievementProgressDto = {
        id: def.id,
        name: def.name,
        description: def.description,
        category: def.category,
        tier: def.tier,
        iconSlug: def.iconSlug,
        earned: isEarned,
      };
      if (def.requiresSettlement) dto.requiresSettlement = true;
      if (earnedAt) dto.earnedAt = earnedAt;
      if (!isEarned && check.progress) dto.progress = check.progress;
      return dto;
    });
  },

  async getProfileAchievements(userId: string) {
    await this.syncUserAchievements(userId);
    const earned = await prisma.userAchievement.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });

    return earned.map((e) => {
      const def = ACHIEVEMENT_CATALOG.find((a) => a.id === e.achievementId);
      return {
        id: e.achievementId,
        name: def?.name ?? e.achievementId,
        description: def?.description ?? '',
        earnedAt: e.earnedAt.toISOString(),
      };
    });
  },
};
