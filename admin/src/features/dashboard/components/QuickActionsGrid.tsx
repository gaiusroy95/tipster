import { Link } from 'react-router-dom'
import type { ComponentType, SVGProps } from 'react'
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  TrophyIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { BetSlipNavIcon } from '@/shared/components/icons/BetSlipIcon'
import { PanelCard } from '@/shared/components/PanelCard'
import { cn } from '@/shared/utils/cn'

const ACTIONS = [
  {
    to: '/users',
    label: 'Manage users',
    description: 'Accounts, bans, and roles',
    icon: UsersIcon,
    accent: 'secondary' as const,
  },
  {
    to: '/leagues',
    label: 'Curate leagues',
    description: 'Enable and sync leagues',
    icon: TrophyIcon,
    accent: 'win' as const,
  },
  {
    to: '/seasons',
    label: 'Season settings',
    description: 'Active season and schedule',
    icon: CalendarDaysIcon,
    accent: 'primary' as const,
  },
  {
    to: '/forum',
    label: 'Moderate forum',
    description: 'Review community posts',
    icon: ChatBubbleLeftRightIcon,
    accent: 'live' as const,
  },
  {
    to: '/bets',
    label: 'Review bets',
    description: 'Inspect open positions',
    icon: BetSlipNavIcon,
    accent: 'primary' as const,
  },
  {
    to: '/audit',
    label: 'Full audit log',
    description: 'Complete action history',
    icon: ClipboardDocumentListIcon,
    accent: 'secondary' as const,
  },
] as const

const accentStyles = {
  secondary: {
    hover: 'from-accent-secondary/20 to-transparent border-accent-secondary/20',
    icon: 'border-accent-secondary/20 text-accent-secondary',
  },
  primary: {
    hover: 'from-accent-primary/20 to-transparent border-accent-primary/20',
    icon: 'border-accent-primary/20 text-accent-primary',
  },
  win: {
    hover: 'from-accent-win/20 to-transparent border-accent-win/20',
    icon: 'border-accent-win/20 text-accent-win',
  },
  live: {
    hover: 'from-accent-live/20 to-transparent border-accent-live/20',
    icon: 'border-accent-live/20 text-accent-live',
  },
} as const

export function QuickActionsGrid() {
  return (
    <PanelCard title="Quick actions" subtitle="One tap to your most-used admin workflows">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        {ACTIONS.map((action) => (
          <QuickActionLink key={action.to} {...action} />
        ))}
      </div>
    </PanelCard>
  )
}

function QuickActionLink({
  to,
  label,
  description,
  icon: Icon,
  accent,
}: {
  to: string
  label: string
  description: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  accent: keyof typeof accentStyles
}) {
  return (
    <Link
      to={to}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border-default/70 bg-bg-elevated/25 p-3.5 transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-border-strong hover:bg-bg-elevated/50',
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100',
          accentStyles[accent].hover,
        )}
        aria-hidden="true"
      />
      <div className="relative flex items-center gap-3">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-bg-surface/80',
            accentStyles[accent].icon,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-text-primary">{label}</span>
          <span className="block text-xs text-text-muted">{description}</span>
        </span>
        <ArrowRightIcon
          className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-1 group-hover:text-text-primary"
          aria-hidden="true"
        />
      </div>
    </Link>
  )
}
