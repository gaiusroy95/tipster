export type AchievementCategory = 'betting' | 'profile' | 'rank' | 'streak';
export type AchievementTier = 'standard' | 'elite';

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  iconSlug: string;
  requiresSettlement?: boolean;
}

export const ACHIEVEMENT_CATALOG: AchievementDefinition[] = [
  { id: 'first-bet', name: 'First Bet', description: 'Place your first virtual bet', category: 'betting', tier: 'standard', iconSlug: 'first-bet' },
  { id: 'big-game', name: 'Big Game', description: 'Place a 100K credit bet', category: 'betting', tier: 'standard', iconSlug: 'big-game' },
  { id: 'daily-limit', name: 'Daily Limit', description: 'Place 3 bets in a single day', category: 'betting', tier: 'standard', iconSlug: 'daily-limit' },
  { id: 'on-the-board', name: 'On the Board', description: 'Have an active bet in play', category: 'betting', tier: 'standard', iconSlug: 'on-the-board' },
  { id: 'first-malay', name: 'Malay Market', description: 'Place your first Malay odds bet', category: 'betting', tier: 'standard', iconSlug: 'first-malay' },
  { id: 'first-handicap', name: 'Handicap Market', description: 'Place your first handicap bet', category: 'betting', tier: 'standard', iconSlug: 'first-handicap' },
  { id: 'first-over-under', name: 'Over / Under', description: 'Place your first over/under bet', category: 'betting', tier: 'standard', iconSlug: 'first-over-under' },
  { id: 'first-winner', name: 'Winner Market', description: 'Place your first 1X2 winner bet', category: 'betting', tier: 'standard', iconSlug: 'first-winner' },
  { id: 'live-punter', name: 'Live Punter', description: 'Place a bet on a live match', category: 'betting', tier: 'standard', iconSlug: 'live-punter' },
  { id: 'cool-head', name: 'Cool Head', description: 'Cancel an active bet', category: 'betting', tier: 'standard', iconSlug: 'cool-head' },
  { id: 'steady-hand', name: 'Steady Hand', description: 'Place 10 bets without cancelling any', category: 'betting', tier: 'elite', iconSlug: 'steady-hand' },
  { id: 'regular', name: 'Regular', description: 'Place 10 virtual bets', category: 'betting', tier: 'standard', iconSlug: 'regular' },
  { id: 'committed', name: 'Committed', description: 'Place 25 virtual bets', category: 'betting', tier: 'elite', iconSlug: 'committed' },
  { id: 'multi-market', name: 'Multi-Market', description: 'Bet on at least 2 different market types', category: 'betting', tier: 'standard', iconSlug: 'multi-market' },
  { id: 'all-markets', name: 'All Markets', description: 'Bet on every market type at least once', category: 'betting', tier: 'elite', iconSlug: 'all-markets' },
  { id: 'arena-debut', name: 'Arena Debut', description: 'Join the Tipster Cup arena', category: 'profile', tier: 'standard', iconSlug: 'arena-debut' },
  { id: 'face-of-arena', name: 'Face of the Arena', description: 'Upload a profile avatar', category: 'profile', tier: 'standard', iconSlug: 'face-of-arena' },
  { id: 'transparent', name: 'Transparent', description: 'Make your profile public', category: 'profile', tier: 'standard', iconSlug: 'transparent' },
  { id: 'connected', name: 'Connected', description: 'Link a social account', category: 'profile', tier: 'standard', iconSlug: 'connected' },
  { id: 'ranked-500', name: 'Ranked', description: 'Reach top 500 on the leaderboard', category: 'rank', tier: 'standard', iconSlug: 'ranked-500' },
  { id: 'ranked-100', name: 'Top 100', description: 'Reach top 100 on the leaderboard', category: 'rank', tier: 'elite', iconSlug: 'ranked-100' },
  { id: 'ranked-10', name: 'Elite Ten', description: 'Reach top 10 on the leaderboard', category: 'rank', tier: 'elite', iconSlug: 'ranked-10' },
  { id: 'first-win', name: 'First Win', description: 'Win your first settled bet', category: 'streak', tier: 'standard', iconSlug: 'first-win', requiresSettlement: true },
  { id: 'hot-streak', name: 'Hot Streak', description: 'Win 3 bets in a row', category: 'streak', tier: 'elite', iconSlug: 'hot-streak', requiresSettlement: true },
  { id: 'on-fire', name: 'On Fire', description: 'Win 5 bets in a row', category: 'streak', tier: 'elite', iconSlug: 'on-fire', requiresSettlement: true },
];

export const ACHIEVEMENT_BY_ID = Object.fromEntries(
  ACHIEVEMENT_CATALOG.map((a) => [a.id, a]),
) as Record<string, AchievementDefinition>;
