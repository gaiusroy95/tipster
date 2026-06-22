import {
  BellIcon,
  LinkIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'
import type { UserSettings } from '@/mocks/data/types'
import { cn } from '@/shared/utils/cn'

interface SettingsOverviewProps {
  settings: UserSettings
  linkedAccountCount: number
}

interface OverviewPill {
  key: string
  label: string
  icon: typeof BellIcon
  iconWrap: string
  value: string
  active: boolean
}

function buildOverviewPills(settings: UserSettings, linkedAccountCount: number): OverviewPill[] {
  return [
    {
      key: 'email',
      label: 'Email alerts',
      icon: EnvelopeIcon,
      iconWrap: 'bg-accent-primary/15 text-accent-primary border-accent-primary/25',
      value: settings.emailNotifications ? 'On' : 'Off',
      active: settings.emailNotifications,
    },
    {
      key: 'push',
      label: 'Push alerts',
      icon: BellIcon,
      iconWrap: 'bg-accent-secondary/15 text-accent-secondary border-accent-secondary/25',
      value: settings.pushNotifications ? 'On' : 'Off',
      active: settings.pushNotifications,
    },
    {
      key: 'privacy',
      label: 'Public profile',
      icon: ShieldCheckIcon,
      iconWrap: 'bg-accent-gold/15 text-accent-gold border-accent-gold/25',
      value: settings.showProfilePublic ? 'On' : 'Off',
      active: settings.showProfilePublic,
    },
    {
      key: 'linked',
      label: 'Linked accounts',
      icon: LinkIcon,
      iconWrap: 'bg-accent-secondary/15 text-accent-secondary border-accent-secondary/25',
      value: linkedAccountCount > 0 ? `${linkedAccountCount} linked` : 'None',
      active: linkedAccountCount > 0,
    },
  ]
}

export function SettingsOverview({ settings, linkedAccountCount }: SettingsOverviewProps) {
  const pills = buildOverviewPills(settings, linkedAccountCount)

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border-default bg-bg-surface">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-secondary/10 via-transparent to-accent-primary/6"
        aria-hidden="true"
      />
      <div className="relative px-4 sm:px-5 py-4 border-b border-border-default/60 bg-bg-elevated/20">
        <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Your preferences
        </p>
        <p className="mt-1 text-sm text-text-muted leading-relaxed">
          Quick overview of notifications, privacy, and sign-in options.
        </p>
      </div>
      <div className="relative grid gap-3 p-4 sm:p-5 sm:grid-cols-2 xl:grid-cols-4">
        {pills.map((pill) => (
          <div
            key={pill.key}
            className="flex items-start gap-3 rounded-xl border border-border-default/70 bg-bg-elevated/40 px-4 py-3.5"
          >
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
                pill.iconWrap,
              )}
            >
              <pill.icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">
                {pill.label}
              </p>
              <p
                className={cn(
                  'mt-0.5 text-lg font-bold tabular-nums',
                  pill.active ? 'text-accent-secondary' : 'text-text-muted',
                )}
              >
                {pill.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
