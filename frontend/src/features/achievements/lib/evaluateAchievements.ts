import { bettingRules } from '@/core/config/bettingRules'
import { MARKET_TYPES } from '@/core/constants/markets'
import type { MarketType } from '@/core/constants/markets'
import { ACHIEVEMENT_CATALOG } from '@/features/achievements/constants/achievementCatalog'
import type {
  AchievementDefinition,
  AchievementProgress,
  EarnedAchievement,
} from '@/features/achievements/types/achievement'
import type { Bet, Match, User, UserSettings } from '@/mocks/data/types'
import type { SocialLink } from '@/mocks/data/socialAuth'

export interface AchievementEvalContext {
  user: User
  bets: Bet[]
  settings: UserSettings
  socialLinks: SocialLink[]
  todayBetCount: number
  getMatch: (matchId: string) => Match | undefined
}

type CheckResult = { earned: boolean; progress?: { current: number; target: number } }

const ALL_MARKETS: MarketType[] = [
  MARKET_TYPES.MALAY,
  MARKET_TYPES.WINNER,
  MARKET_TYPES.HANDICAP,
  MARKET_TYPES.OVER_UNDER,
]

function placedBets(bets: Bet[]) {
  return bets.filter((b) => b.status !== 'cancelled')
}

function cancelledCount(bets: Bet[]) {
  return bets.filter((b) => b.status === 'cancelled').length
}

function uniqueMarkets(bets: Bet[]) {
  return new Set(placedBets(bets).map((b) => b.marketType))
}

function maxBetsOnAnyDay(bets: Bet[]) {
  const byDay: Record<string, number> = {}
  for (const bet of bets) {
    const day = bet.placedAt.slice(0, 10)
    byDay[day] = (byDay[day] ?? 0) + 1
  }
  return Math.max(0, ...Object.values(byDay))
}

function maxWinStreak(bets: Bet[]) {
  const settled = bets
    .filter((b) => b.status === 'won' || b.status === 'lost')
    .sort((a, b) =>
      (a.settledAt ?? a.placedAt).localeCompare(b.settledAt ?? b.placedAt),
    )

  let streak = 0
  let max = 0
  for (const bet of settled) {
    if (bet.status === 'won') {
      streak += 1
      max = Math.max(max, streak)
    } else {
      streak = 0
    }
  }
  return max
}

function hasLiveBet(ctx: AchievementEvalContext) {
  return placedBets(ctx.bets).some((bet) => {
    const match = ctx.getMatch(bet.matchId)
    return match?.status === 'live'
  })
}

function checkAchievement(def: AchievementDefinition, ctx: AchievementEvalContext): CheckResult {
  const placed = placedBets(ctx.bets)
  const totalPlaced = placed.length
  const markets = uniqueMarkets(ctx.bets)
  const cancelled = cancelledCount(ctx.bets)
  const winStreak = maxWinStreak(ctx.bets)
  const wins = ctx.bets.filter((b) => b.status === 'won').length

  switch (def.id) {
    case 'first-bet':
      return {
        earned: totalPlaced >= 1,
        progress: { current: Math.min(totalPlaced, 1), target: 1 },
      }
    case 'big-game':
      const big = placed.some(
        (b) => b.stake === bettingRules.premiumStake || b.betSize === 'big',
      )
      return { earned: big, progress: { current: big ? 1 : 0, target: 1 } }
    case 'daily-limit':
      const dayMax = Math.max(ctx.todayBetCount, maxBetsOnAnyDay(ctx.bets))
      return {
        earned: dayMax >= bettingRules.dailyBetLimit,
        progress: {
          current: Math.min(dayMax, bettingRules.dailyBetLimit),
          target: bettingRules.dailyBetLimit,
        },
      }
    case 'on-the-board':
      const active = ctx.bets.some((b) => b.status === 'active')
      return { earned: active, progress: { current: active ? 1 : 0, target: 1 } }
    case 'first-malay':
      const malay = placed.some((b) => b.marketType === MARKET_TYPES.MALAY)
      return { earned: malay, progress: { current: malay ? 1 : 0, target: 1 } }
    case 'first-handicap':
      const handicap = placed.some((b) => b.marketType === MARKET_TYPES.HANDICAP)
      return { earned: handicap, progress: { current: handicap ? 1 : 0, target: 1 } }
    case 'first-over-under':
      const ou = placed.some((b) => b.marketType === MARKET_TYPES.OVER_UNDER)
      return { earned: ou, progress: { current: ou ? 1 : 0, target: 1 } }
    case 'first-winner':
      const winner = placed.some((b) => b.marketType === MARKET_TYPES.WINNER)
      return { earned: winner, progress: { current: winner ? 1 : 0, target: 1 } }
    case 'live-punter':
      const live = hasLiveBet(ctx)
      return { earned: live, progress: { current: live ? 1 : 0, target: 1 } }
    case 'cool-head':
      const cooled = cancelled > 0
      return { earned: cooled, progress: { current: cooled ? 1 : 0, target: 1 } }
    case 'steady-hand':
      if (cancelled > 0) {
        return { earned: false, progress: { current: 0, target: 10 } }
      }
      return {
        earned: totalPlaced >= 10,
        progress: { current: Math.min(totalPlaced, 10), target: 10 },
      }
    case 'regular':
      return {
        earned: totalPlaced >= 10,
        progress: { current: Math.min(totalPlaced, 10), target: 10 },
      }
    case 'committed':
      return {
        earned: totalPlaced >= 25,
        progress: { current: Math.min(totalPlaced, 25), target: 25 },
      }
    case 'multi-market':
      return {
        earned: markets.size >= 2,
        progress: { current: Math.min(markets.size, 2), target: 2 },
      }
    case 'all-markets':
      const allCount = ALL_MARKETS.filter((m) => markets.has(m)).length
      return {
        earned: allCount >= ALL_MARKETS.length,
        progress: { current: allCount, target: ALL_MARKETS.length },
      }
    case 'arena-debut':
      return { earned: true, progress: { current: 1, target: 1 } }
    case 'face-of-arena':
      const avatar = Boolean(ctx.user.avatarUrl)
      return { earned: avatar, progress: { current: avatar ? 1 : 0, target: 1 } }
    case 'transparent':
      const publicProfile = ctx.settings.showProfilePublic
      return {
        earned: publicProfile,
        progress: { current: publicProfile ? 1 : 0, target: 1 },
      }
    case 'connected':
      const linked =
        ctx.socialLinks.length > 0 ||
        (ctx.user.authProviders?.some((p) => p !== 'email') ?? false)
      return { earned: linked, progress: { current: linked ? 1 : 0, target: 1 } }
    case 'ranked-500':
      return {
        earned: ctx.user.rank <= 500,
        progress: { current: ctx.user.rank <= 500 ? 1 : 0, target: 1 },
      }
    case 'ranked-100':
      return {
        earned: ctx.user.rank <= 100,
        progress: { current: ctx.user.rank <= 100 ? 1 : 0, target: 1 },
      }
    case 'ranked-10':
      return {
        earned: ctx.user.rank <= 10,
        progress: { current: ctx.user.rank <= 10 ? 1 : 0, target: 1 },
      }
    case 'first-win':
      return {
        earned: wins >= 1,
        progress: { current: Math.min(wins, 1), target: 1 },
      }
    case 'hot-streak':
      return {
        earned: winStreak >= 3,
        progress: { current: Math.min(winStreak, 3), target: 3 },
      }
    case 'on-fire':
      return {
        earned: winStreak >= 5,
        progress: { current: Math.min(winStreak, 5), target: 5 },
      }
    default:
      return { earned: false }
  }
}

export function buildAchievementProgressList(
  ctx: AchievementEvalContext,
  earned: EarnedAchievement[],
): AchievementProgress[] {
  const earnedMap = new Map(earned.map((e) => [e.id, e]))

  return ACHIEVEMENT_CATALOG.map((def) => {
    const stored = earnedMap.get(def.id)
    const check = checkAchievement(def, ctx)

    const isEarned = stored !== undefined || check.earned

    return {
      id: def.id,
      name: def.name,
      description: def.description,
      category: def.category,
      tier: def.tier,
      iconSlug: def.iconSlug,
      requiresSettlement: def.requiresSettlement,
      earned: isEarned,
      earnedAt: stored?.earnedAt,
      progress: isEarned ? undefined : check.progress,
    }
  })
}

export function syncEarnedAchievements(
  ctx: AchievementEvalContext,
  existing: EarnedAchievement[],
): EarnedAchievement[] {
  const earnedMap = new Map(existing.map((e) => [e.id, e]))
  const now = new Date().toISOString()

  for (const def of ACHIEVEMENT_CATALOG) {
    if (earnedMap.has(def.id)) continue
    const { earned } = checkAchievement(def, ctx)
    if (earned) {
      earnedMap.set(def.id, { id: def.id, earnedAt: now })
    }
  }

  return Array.from(earnedMap.values()).sort((a, b) =>
    b.earnedAt.localeCompare(a.earnedAt),
  )
}

export function toProfileAchievements(earned: EarnedAchievement[]) {
  return earned.map((e) => {
    const def = ACHIEVEMENT_CATALOG.find((a) => a.id === e.id)
    return {
      id: e.id,
      name: def?.name ?? e.id,
      description: def?.description ?? '',
      earnedAt: e.earnedAt,
    }
  })
}
