import type { ComponentType, SVGProps } from 'react'
import {
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  ScaleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

export type ArenaMarketCategory = 'winner' | 'handicap' | 'over_under' | 'malay' | 'extended'

export interface MarketTypeConfig {
  id: string
  marketType: string
  label: string
  description: string | null
  isEnabled: boolean
  sortOrder: number
}

export interface OvertimeMarketTypeRow {
  id: number
  key: string
  name: string
  category: ArenaMarketCategory
  categoryLabel: string
}

export const ARENA_MARKET_META: Record<
  string,
  {
    icon: ComponentType<SVGProps<SVGSVGElement>>
    accent: 'win' | 'secondary' | 'primary'
    shortLabel: string
    surface: string
    hint: string
  }
> = {
  winner: {
    icon: ScaleIcon,
    accent: 'win',
    shortLabel: '1X2',
    surface: 'from-accent-win/15 via-accent-win/5 to-transparent',
    hint: 'Home, draw, and away columns on fixture cards and match detail.',
  },
  handicap: {
    icon: AdjustmentsHorizontalIcon,
    accent: 'secondary',
    shortLabel: 'HCP',
    surface: 'from-accent-secondary/15 via-accent-secondary/5 to-transparent',
    hint: 'Asian handicap lines — spread markets from Overtime roll up here.',
  },
  over_under: {
    icon: ChartBarIcon,
    accent: 'primary',
    shortLabel: 'O/U',
    surface: 'from-accent-primary/15 via-accent-primary/5 to-transparent',
    hint: 'Total goals/points over and under markets on lists and detail pages.',
  },
  malay: {
    icon: SparklesIcon,
    accent: 'secondary',
    shortLabel: 'Malay',
    surface: 'from-accent-secondary/10 via-transparent to-transparent',
    hint: 'Malay odds format tab on match detail — derived from winner pricing.',
  },
}

export const CATEGORY_BADGE_VARIANT: Record<
  ArenaMarketCategory,
  'win' | 'secondary' | 'primary' | 'default'
> = {
  winner: 'win',
  handicap: 'secondary',
  over_under: 'primary',
  malay: 'secondary',
  extended: 'default',
}

export function summarizeCatalog(catalog: OvertimeMarketTypeRow[]) {
  const byCategory = catalog.reduce<Record<ArenaMarketCategory, number>>(
    (acc, row) => {
      acc[row.category] = (acc[row.category] ?? 0) + 1
      return acc
    },
    { winner: 0, handicap: 0, over_under: 0, malay: 0, extended: 0 },
  )

  return {
    total: catalog.length,
    byCategory,
    extended: byCategory.extended,
  }
}

export function filterCatalog(
  catalog: OvertimeMarketTypeRow[],
  search: string,
  category: 'all' | ArenaMarketCategory,
) {
  const q = search.trim().toLowerCase()
  return catalog.filter((row) => {
    if (category !== 'all' && row.category !== category) return false
    if (!q) return true
    return (
      row.name.toLowerCase().includes(q) ||
      row.key.toLowerCase().includes(q) ||
      row.categoryLabel.toLowerCase().includes(q) ||
      String(row.id).includes(q)
    )
  })
}
