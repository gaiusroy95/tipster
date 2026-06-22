import {
  buildAchievementProgressList,
  syncEarnedAchievements,
  toProfileAchievements,
  type AchievementEvalContext,
} from '@/features/achievements/lib/evaluateAchievements'
import type { AchievementProgress, EarnedAchievement } from '@/features/achievements/types/achievement'
import type { Bet, Match, User, UserSettings } from '@/mocks/data/types'
import type { SocialLink } from '@/mocks/data/socialAuth'

export interface AchievementDb {
  getUser(userId: string): User | undefined
  getBets(): Bet[]
  getMatch(matchId: string): Match | undefined
  getSocialLinks(userId: string): SocialLink[]
  getTodayBetCount(userId: string): number
  settings: Record<string, UserSettings>
}

const userAchievements: Record<string, EarnedAchievement[]> = {}

export function buildAchievementContext(
  db: AchievementDb,
  userId: string,
): AchievementEvalContext | null {
  const user = db.getUser(userId)
  if (!user) return null

  return {
    user,
    bets: db.getBets().filter((b) => b.userId === userId),
    settings: db.settings[userId] ?? {
      emailNotifications: true,
      pushNotifications: false,
      showProfilePublic: true,
    },
    socialLinks: db.getSocialLinks(userId),
    todayBetCount: db.getTodayBetCount(userId),
    getMatch: (matchId) => db.getMatch(matchId),
  }
}

export function syncUserAchievements(db: AchievementDb, userId: string): EarnedAchievement[] {
  const ctx = buildAchievementContext(db, userId)
  if (!ctx) return []

  const existing = userAchievements[userId] ?? []
  const synced = syncEarnedAchievements(ctx, existing)
  userAchievements[userId] = synced
  return synced
}

export function getUserAchievementProgress(
  db: AchievementDb,
  userId: string,
): AchievementProgress[] {
  const ctx = buildAchievementContext(db, userId)
  if (!ctx) return []

  const earned = syncUserAchievements(db, userId)
  return buildAchievementProgressList(ctx, earned)
}

export function getProfileAchievements(db: AchievementDb, userId: string) {
  const earned = syncUserAchievements(db, userId)
  return toProfileAchievements(earned)
}

export function seedUserAchievements(userId: string, earned: EarnedAchievement[]) {
  userAchievements[userId] = earned
}
