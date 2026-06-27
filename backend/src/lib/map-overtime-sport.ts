const OVERTIME_CATEGORY_TO_SPORT_ID: Record<string, string> = {
  Soccer: 'soccer',
  Football: 'soccer',
  Basketball: 'basketball',
  Volleyball: 'volleyball',
  Tennis: 'tennis',
  Hockey: 'hockey',
  'Ice Hockey': 'hockey',
  Baseball: 'baseball',
  MMA: 'mma',
  Fighting: 'mma',
  Boxing: 'mma',
  Esports: 'esports',
  'E-Sports': 'esports',
};

/** Legacy or slug sport IDs stored before category mapping was complete. */
const SPORT_ID_ALIASES: Record<string, string> = {
  fighting: 'mma',
  boxing: 'mma',
};

export function normalizeSportId(sportId: string): string {
  return SPORT_ID_ALIASES[sportId] ?? sportId;
}

export function mapOvertimeCategoryToSportId(category: string): string {
  const trimmed = category.trim();
  if (OVERTIME_CATEGORY_TO_SPORT_ID[trimmed]) {
    return OVERTIME_CATEGORY_TO_SPORT_ID[trimmed];
  }
  return normalizeSportId(trimmed.toLowerCase().replace(/\s+/g, '_'));
}
