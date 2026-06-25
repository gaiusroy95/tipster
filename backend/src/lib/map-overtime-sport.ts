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
  Esports: 'esports',
  'E-Sports': 'esports',
};

export function mapOvertimeCategoryToSportId(category: string): string {
  const trimmed = category.trim();
  if (OVERTIME_CATEGORY_TO_SPORT_ID[trimmed]) {
    return OVERTIME_CATEGORY_TO_SPORT_ID[trimmed];
  }
  return trimmed.toLowerCase().replace(/\s+/g, '_');
}
