import type { ComponentType, SVGProps } from 'react'
import {
  ChartBarSquareIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  Squares2X2Icon,
  TrophyIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { BetSlipNavIcon } from '@/shared/components/icons/BetSlipIcon'

export type AdminNavItem = {
  to: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  end?: boolean
}

export type AdminNavGroup = {
  title: string
  items: AdminNavItem[]
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    title: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: ChartBarSquareIcon, end: true }],
  },
  {
    title: 'Platform',
    items: [
      { to: '/users', label: 'Users', icon: UsersIcon },
      { to: '/leagues', label: 'Leagues', icon: TrophyIcon },
      { to: '/markets', label: 'Markets', icon: Squares2X2Icon },
      { to: '/seasons', label: 'Seasons', icon: CalendarDaysIcon },
      { to: '/bets', label: 'Bets', icon: BetSlipNavIcon },
    ],
  },
  {
    title: 'Moderation',
    items: [
      { to: '/forum', label: 'Forum', icon: ChatBubbleLeftRightIcon },
      { to: '/audit', label: 'Audit log', icon: ClipboardDocumentListIcon },
    ],
  },
]

export const ADMIN_ROUTE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/users': 'Users',
  '/leagues': 'Leagues',
  '/markets': 'Markets',
  '/seasons': 'Seasons',
  '/bets': 'Bets',
  '/forum': 'Forum',
  '/audit': 'Audit log',
}

export function getAdminRouteMeta(pathname: string) {
  for (const group of ADMIN_NAV_GROUPS) {
    for (const item of group.items) {
      const matches = item.end ? pathname === item.to : pathname === item.to
      if (matches) {
        return {
          title: item.label,
          group: group.title,
          icon: item.icon,
        }
      }
    }
  }

  return {
    title: ADMIN_ROUTE_LABELS[pathname] ?? 'Admin',
    group: 'Console',
    icon: ChartBarSquareIcon,
  }
}
