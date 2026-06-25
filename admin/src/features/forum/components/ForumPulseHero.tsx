import {
  ChatBubbleLeftRightIcon,
  EyeIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/shared/utils/cn'

export function ForumPulseHero({
  total,
  loaded,
  views,
  comments,
  authors,
  hidden,
}: {
  total: number
  loaded: number
  views: number
  comments: number
  authors: number
  hidden: number
}) {
  const metrics = [
    {
      label: 'Threads',
      value: loaded,
      suffix: `of ${total}`,
      icon: ChatBubbleLeftRightIcon,
      tone: 'text-accent-live',
      ring: 'border-accent-live/25 bg-accent-live/10',
    },
    {
      label: 'Engagement',
      value: views + comments,
      caption: `${views} views · ${comments} replies`,
      icon: EyeIcon,
      tone: 'text-accent-secondary',
      ring: 'border-accent-secondary/25 bg-accent-secondary/10',
    },
    {
      label: 'Voices',
      value: authors,
      caption: 'Unique authors in view',
      icon: UserGroupIcon,
      tone: 'text-accent-primary',
      ring: 'border-accent-primary/25 bg-accent-primary/10',
    },
    {
      label: 'Hidden',
      value: hidden,
      caption: hidden > 0 ? 'Needs review' : 'Queue clear',
      icon: SparklesIcon,
      tone: hidden > 0 ? 'text-accent-loss' : 'text-accent-win',
      ring: hidden > 0 ? 'border-accent-loss/25 bg-accent-loss/10' : 'border-accent-win/25 bg-accent-win/10',
      pulse: hidden > 0,
    },
  ]

  return (
    <section className="forum-pulse-hero relative overflow-hidden rounded-[1.75rem] border border-border-default/50">
      <div
        className="pointer-events-none absolute inset-0 forum-pulse-mesh opacity-90"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-24 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-accent-live/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 -top-10 h-48 w-48 rounded-full bg-accent-secondary/20 blur-3xl"
        aria-hidden="true"
      />
      <div className="forum-pulse-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />

      <div className="relative px-5 py-7 sm:px-8 sm:py-9">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between xl:gap-6">
          <div className="min-w-0 max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent-live/30 bg-accent-live/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-accent-live">
                <span className="forum-live-dot h-2 w-2 rounded-full bg-accent-live" aria-hidden="true" />
                Moderation desk
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted">
                Community pulse
              </span>
            </div>

            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]">
                Every conversation
                <span className="block bg-gradient-to-r from-accent-live via-rose-300 to-accent-secondary bg-clip-text text-transparent">
                  under your spotlight
                </span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-muted sm:text-base">
                Curate the arena forum with editorial precision — scan threads at a glance, inspect
                full context instantly, and act before noise spreads.
              </p>
            </div>
          </div>

          <div className="grid w-full min-w-0 grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2 xl:max-w-md xl:flex-1 2xl:max-w-lg">
            {metrics.map((metric) => {
              const Icon = metric.icon
              return (
                <div
                  key={metric.label}
                  className={cn(
                    'forum-metric-tile relative min-w-0 overflow-hidden rounded-2xl border p-3.5 backdrop-blur-sm sm:p-4',
                    metric.ring,
                  )}
                >
                  <div className="flex items-start gap-2">
                    <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', metric.tone)} aria-hidden="true" />
                    <span className="min-w-0 flex-1 text-[10px] font-semibold uppercase leading-tight tracking-[0.08em] text-text-muted">
                      {metric.label}
                    </span>
                    {metric.pulse ? (
                      <span
                        className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent-loss forum-live-dot"
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

      <div className="forum-pulse-wave pointer-events-none h-3 w-full opacity-40" aria-hidden="true" />
    </section>
  )
}
