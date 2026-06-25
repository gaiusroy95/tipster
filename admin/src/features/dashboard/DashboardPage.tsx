import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  TicketIcon,
  TrophyIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { adminClient } from '@/core/api/client'
import { queryKeys } from '@/core/constants/queryKeys'
import type { ApiResponse } from '@/core/types/api'
import { Badge } from '@/shared/components/Badge'
import { PageShell } from '@/shared/components/PageShell'
import { PanelCard } from '@/shared/components/PanelCard'
import { StatCard } from '@/shared/components/StatCard'
import { Button } from '@/shared/components/ui/Button'
import { Skeleton } from '@/shared/components/ui/Card'

interface DashboardStats {
  userCount: number
  activeBets: number
  forumPosts: number
  enabledLeagues: number
  activeSeason: { id: string; name: string } | null
  recentAudit: Array<{
    id: string
    action: string
    entityType: string
    createdAt: string
    admin: { displayName: string; email: string }
  }>
}

const QUICK_LINKS = [
  { to: '/users', label: 'Manage users', description: 'Accounts, bans, roles', icon: UsersIcon },
  { to: '/leagues', label: 'Curate leagues', description: 'Enable or sync leagues', icon: TrophyIcon },
  { to: '/seasons', label: 'Season settings', description: 'Active season & schedule', icon: CalendarDaysIcon },
  { to: '/audit', label: 'Full audit log', description: 'Review all admin actions', icon: ClipboardDocumentListIcon },
] as const

function formatAuditTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: async () => {
      const res = await adminClient.get<ApiResponse<DashboardStats>>('/stats')
      return res.data.data
    },
  })

  if (isLoading) {
    return (
      <PageShell title="Dashboard" description="Platform overview and recent activity">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          <Skeleton className="h-64 rounded-2xl xl:col-span-2" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </PageShell>
    )
  }

  if (error || !data) {
    return (
      <PageShell title="Dashboard">
        <div className="rounded-2xl border border-accent-loss/30 bg-accent-loss/10 p-6 text-sm text-accent-loss">
          Failed to load dashboard statistics. Refresh the page or check your connection.
        </div>
      </PageShell>
    )
  }

  const kpis = [
    {
      label: 'Users',
      value: data.userCount,
      sublabel: 'Registered accounts',
      icon: UsersIcon,
      accent: 'secondary' as const,
    },
    {
      label: 'Active bets',
      value: data.activeBets,
      sublabel: 'Open positions',
      icon: TicketIcon,
      accent: 'primary' as const,
    },
    {
      label: 'Forum posts',
      value: data.forumPosts,
      sublabel: 'Community threads',
      icon: ChatBubbleLeftRightIcon,
      accent: 'live' as const,
    },
    {
      label: 'Enabled leagues',
      value: data.enabledLeagues,
      sublabel: 'Curated for arena',
      icon: TrophyIcon,
      accent: 'win' as const,
    },
  ]

  return (
    <PageShell
      title="Dashboard"
      description="Monitor platform health, activity, and moderation at a glance."
      badge={
        data.activeSeason ? (
          <Badge variant="primary">{data.activeSeason.name}</Badge>
        ) : (
          <Badge>No active season</Badge>
        )
      }
      action={
        <Link to="/audit">
          <Button variant="secondary" size="sm">
            View audit log
          </Button>
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <StatCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <PanelCard
          title="Recent audit activity"
          subtitle="Latest administrative actions across the platform"
          className="xl:col-span-2"
          action={
            <Link
              to="/audit"
              className="inline-flex items-center gap-1 text-xs font-medium text-accent-secondary hover:text-text-primary"
            >
              View all
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          }
        >
          {data.recentAudit.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-default bg-bg-elevated/30 px-4 py-10 text-center">
              <ClipboardDocumentListIcon className="mx-auto h-8 w-8 text-text-muted/60" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium">No audit entries yet</p>
              <p className="mt-1 text-xs text-text-muted">
                Admin actions will appear here as they happen.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {data.recentAudit.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-col gap-2 rounded-xl border border-border-default/70 bg-bg-elevated/35 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-accent-secondary/25 bg-accent-secondary/10 px-2 py-0.5 text-xs font-semibold text-accent-secondary">
                        {entry.action}
                      </span>
                      <span className="text-xs text-text-muted">{entry.entityType}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-text-muted">
                      by <span className="font-medium text-text-primary">{entry.admin.displayName}</span>
                    </p>
                  </div>
                  <time
                    className="shrink-0 text-xs font-mono text-text-muted sm:text-right"
                    dateTime={entry.createdAt}
                  >
                    {formatAuditTime(entry.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </PanelCard>

        <PanelCard title="Quick actions" subtitle="Jump to common admin tasks">
          <div className="space-y-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="group flex items-center gap-3 rounded-xl border border-border-default/70 bg-bg-elevated/30 p-3 transition-colors hover:border-accent-secondary/30 hover:bg-accent-secondary/5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-surface text-accent-secondary group-hover:border-accent-secondary/30 group-hover:bg-accent-secondary/10">
                  <link.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{link.label}</span>
                  <span className="block text-xs text-text-muted">{link.description}</span>
                </span>
                <ArrowTopRightOnSquareIcon
                  className="h-4 w-4 shrink-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </PanelCard>
      </div>
    </PageShell>
  )
}
