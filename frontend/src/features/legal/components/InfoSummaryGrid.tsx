import type { ComponentType, SVGProps } from 'react'
import type { InfoPageVariant } from '@/features/legal/constants/infoPageThemes'
import { cn } from '@/shared/utils/cn'

export interface InfoSummaryItem {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: string
  accent?: 'secondary' | 'gold' | 'win' | 'live' | 'primary'
}

const accentMap = {
  secondary: 'text-accent-secondary bg-accent-secondary/10 border-accent-secondary/25',
  gold: 'text-accent-gold bg-accent-gold/10 border-accent-gold/25',
  win: 'text-accent-win bg-accent-win/10 border-accent-win/25',
  live: 'text-accent-live bg-accent-live/10 border-accent-live/25',
  primary: 'text-accent-primary bg-accent-primary/10 border-accent-primary/25',
}

export function InfoSummaryGrid({ variant, items }: { variant: InfoPageVariant; items: InfoSummaryItem[] }) {
  if (variant === 'privacy') {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.title}
              className="flex gap-3 rounded-xl border border-accent-win/20 bg-accent-win/[0.04] p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-win/10 text-accent-win">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-text-primary">{item.title}</h3>
                <p className="mt-1 text-xs text-text-muted leading-relaxed">{item.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (variant === 'rules') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.title}
              className="rounded-lg border border-accent-gold/25 bg-bg-surface p-3 text-center sm:p-4"
            >
              <Icon className="h-5 w-5 mx-auto text-accent-gold mb-2" aria-hidden="true" />
              <p className="text-xs sm:text-sm font-bold text-text-primary leading-tight">{item.title}</p>
              <p className="mt-1 text-[10px] sm:text-xs text-text-muted leading-snug hidden sm:block">{item.description}</p>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon
        const accent = accentMap[item.accent ?? 'secondary']
        return (
          <div key={item.title} className="rounded-xl border border-border-default/70 bg-bg-surface p-4 shadow-card">
            <div className={cn('mb-3 inline-flex rounded-lg border p-2', accent)}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="font-display text-sm font-bold text-text-primary">{item.title}</h3>
            <p className="mt-1.5 text-xs sm:text-sm text-text-muted leading-relaxed">{item.description}</p>
          </div>
        )
      })}
    </div>
  )
}
