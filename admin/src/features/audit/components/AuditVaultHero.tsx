import {
  ClockIcon,
  ExclamationTriangleIcon,
  FingerPrintIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/shared/utils/cn'

export function AuditVaultHero({
  total,
  loaded,
  recent24h,
  admins,
  critical,
}: {
  total: number
  loaded: number
  recent24h: number
  admins: number
  critical: number
}) {
  const metrics = [
    {
      label: 'Events',
      value: loaded,
      suffix: `of ${total}`,
      icon: FingerPrintIcon,
      ring: 'border-cyan-400/25 bg-cyan-400/10',
      tone: 'text-cyan-300',
    },
    {
      label: 'Last 24h',
      value: recent24h,
      caption: 'Recent admin activity',
      icon: ClockIcon,
      ring: 'border-accent-secondary/25 bg-accent-secondary/10',
      tone: 'text-accent-secondary',
    },
    {
      label: 'Operators',
      value: admins,
      caption: 'Unique admins in view',
      icon: ShieldCheckIcon,
      ring: 'border-accent-win/25 bg-accent-win/10',
      tone: 'text-accent-win',
    },
    {
      label: 'Critical',
      value: critical,
      caption: critical > 0 ? 'Destructive actions' : 'No destructive events',
      icon: ExclamationTriangleIcon,
      ring:
        critical > 0
          ? 'border-accent-loss/25 bg-accent-loss/10'
          : 'border-accent-win/25 bg-accent-win/10',
      tone: critical > 0 ? 'text-accent-loss' : 'text-accent-win',
      pulse: critical > 0,
    },
  ]

  return (
    <section className="audit-vault-hero relative overflow-hidden rounded-[1.75rem] border border-border-default/50">
      <div className="pointer-events-none absolute inset-0 audit-vault-mesh" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -right-20 top-0 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-accent-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="audit-vault-scanlines pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />

      <div className="relative px-5 py-7 sm:px-8 sm:py-9">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                <span className="audit-vault-dot h-2 w-2 rounded-full bg-cyan-400" aria-hidden="true" />
                Immutable chronicle
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                Forensic trail
              </span>
            </div>

            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]">
                Every admin action
                <span className="block bg-gradient-to-r from-cyan-300 via-teal-200 to-accent-primary bg-clip-text text-transparent">
                  etched in the vault
                </span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-muted sm:text-base">
                Trace platform changes with forensic clarity — who acted, what changed, and when
                the record was sealed. Nothing leaves without a footprint.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:max-w-3xl xl:flex-1">
            {metrics.map((metric) => {
              const Icon = metric.icon
              return (
                <div
                  key={metric.label}
                  className={cn(
                    'audit-metric-tile relative overflow-hidden rounded-2xl border p-3.5 backdrop-blur-sm sm:p-4',
                    metric.ring,
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-4 w-4', metric.tone)} aria-hidden="true" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                      {metric.label}
                    </span>
                    {metric.pulse ? (
                      <span
                        className="audit-vault-dot ml-auto h-2 w-2 rounded-full bg-accent-loss"
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>
                  <p className="mt-2 font-display text-2xl font-bold tabular-nums">
                    {metric.value}
                    {'suffix' in metric && metric.suffix ? (
                      <span className="ml-1 text-sm font-medium text-text-muted">{metric.suffix}</span>
                    ) : null}
                  </p>
                  {metric.caption ? (
                    <p className="mt-1 text-[11px] leading-snug text-text-muted">{metric.caption}</p>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="audit-vault-footer pointer-events-none h-px w-full bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" aria-hidden="true" />
    </section>
  )
}
