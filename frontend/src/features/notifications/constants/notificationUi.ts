import type { ComponentType, SVGProps } from 'react'
import {
  BellAlertIcon,
  CalendarDaysIcon,
  SparklesIcon,
  TicketIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import type { NotificationType } from '@/core/constants/markets'

export interface NotificationTypeMeta {
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  iconClass: string
  badgeClass: string
}

export const NOTIFICATION_TYPE_META: Record<NotificationType, NotificationTypeMeta> = {
  system: {
    label: 'System',
    icon: SparklesIcon,
    iconClass: 'text-accent-secondary bg-accent-secondary/15 border-accent-secondary/25',
    badgeClass: 'bg-accent-secondary/10 text-accent-secondary border-accent-secondary/25',
  },
  bet_result: {
    label: 'Bet update',
    icon: TicketIcon,
    iconClass: 'text-accent-primary bg-accent-primary/15 border-accent-primary/25',
    badgeClass: 'bg-accent-primary/10 text-accent-primary border-accent-primary/25',
  },
  rank_change: {
    label: 'Ranking',
    icon: TrophyIcon,
    iconClass: 'text-accent-gold bg-accent-gold/15 border-accent-gold/25',
    badgeClass: 'bg-accent-gold/10 text-accent-gold border-accent-gold/25',
  },
  season: {
    label: 'Season',
    icon: CalendarDaysIcon,
    iconClass: 'text-accent-win bg-accent-win/15 border-accent-win/25',
    badgeClass: 'bg-accent-win/10 text-accent-win border-accent-win/25',
  },
}

export function getNotificationMeta(type: string): NotificationTypeMeta {
  return NOTIFICATION_TYPE_META[type as NotificationType] ?? {
    label: 'Update',
    icon: BellAlertIcon,
    iconClass: 'text-text-muted bg-bg-elevated border-border-default',
    badgeClass: 'bg-bg-elevated text-text-muted border-border-default',
  }
}

export type NotificationFilter = 'all' | 'unread'

export function groupNotificationsByDate<T extends { createdAt: string }>(
  items: T[],
): { label: string; items: T[] }[] {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - 7)

  const buckets: Record<string, T[]> = {
    Today: [],
    Yesterday: [],
    'This week': [],
    Earlier: [],
  }

  for (const item of items) {
    const date = new Date(item.createdAt)
    if (date >= startOfToday) buckets.Today.push(item)
    else if (date >= startOfYesterday) buckets.Yesterday.push(item)
    else if (date >= startOfWeek) buckets['This week'].push(item)
    else buckets.Earlier.push(item)
  }

  return (['Today', 'Yesterday', 'This week', 'Earlier'] as const)
    .filter((label) => buckets[label].length > 0)
    .map((label) => ({ label, items: buckets[label] }))
}
