import type { ComponentType, SVGProps } from 'react'
import { cn } from '@/shared/utils/cn'

export interface LegalSummaryItem {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: string
  accent?: 'secondary' | 'gold' | 'win' | 'live'
}

const accentMap = {
  secondary: 'text-accent-secondary bg-accent-secondary/10 border-accent-secondary/25',
  gold: 'text-accent-gold bg-accent-gold/10 border-accent-gold/25',
  win: 'text-accent-win bg-accent-win/10 border-accent-win/25',
  live: 'text-accent-live bg-accent-live/10 border-accent-live/25',
}

export function LegalSummaryGrid({ items }: { items: LegalSummaryItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon
        const accent = accentMap[item.accent ?? 'secondary']
        return (
          <div
            key={item.title}
            className="rounded-xl border border-border-default/70 bg-bg-surface p-4 shadow-card"
          >
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
