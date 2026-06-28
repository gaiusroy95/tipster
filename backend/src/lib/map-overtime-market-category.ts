export type ArenaMarketCategory = 'winner' | 'handicap' | 'over_under' | 'malay' | 'extended';

const HANDICAP_HINTS = ['spread', 'handicap', 'runline', 'puckline', 'asianhandicap'];
const TOTAL_HINTS = ['total', 'overunder', 'over_under', 'goals', 'points'];
const WINNER_HINTS = ['winner', 'moneyline', '1x2', 'matchwinner'];

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function mapOvertimeMarketTypeToCategory(
  key: string,
  typeId?: number,
): ArenaMarketCategory {
  if (typeId === 0) return 'winner';
  if (typeId === 10001) return 'handicap';
  if (typeId === 10002) return 'over_under';

  const normalized = normalizeKey(key);

  if (HANDICAP_HINTS.some((hint) => normalized.includes(hint))) {
    return 'handicap';
  }
  if (TOTAL_HINTS.some((hint) => normalized.includes(hint))) {
    return 'over_under';
  }
  if (WINNER_HINTS.some((hint) => normalized.includes(hint))) {
    return 'winner';
  }

  return 'extended';
}

export function arenaCategoryLabel(category: ArenaMarketCategory): string {
  switch (category) {
    case 'winner':
      return '1X2 / Winner';
    case 'handicap':
      return 'Handicap';
    case 'over_under':
      return 'Over/Under';
    case 'malay':
      return 'Malay odds';
    default:
      return 'Extended';
  }
}
