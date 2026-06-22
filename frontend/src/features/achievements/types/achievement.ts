export type AchievementCategory = 'betting' | 'profile' | 'rank' | 'streak'

export type AchievementTier = 'standard' | 'elite'

export interface AchievementDefinition {
  id: string
  name: string
  description: string
  category: AchievementCategory
  tier: AchievementTier
  /** Maps to `/assets/Icon/{iconSlug}.png` when assets are provided */
  iconSlug: string
  requiresSettlement?: boolean
}

export interface AchievementProgress {
  id: string
  name: string
  description: string
  category: AchievementCategory
  tier: AchievementTier
  iconSlug: string
  earned: boolean
  earnedAt?: string
  progress?: { current: number; target: number }
  requiresSettlement?: boolean
}

export interface EarnedAchievement {
  id: string
  earnedAt: string
}
