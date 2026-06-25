import type { ComponentType, SVGProps } from 'react'
import { cn } from '@/shared/utils/cn'

type StatAccent = 'secondary' | 'primary' | 'win' | 'live' | 'gold'

const accentStyles: Record<
  StatAccent,
  { icon: string; glow: string; value: string }
> = {
  secondary: {
    icon: 'text-accent-secondary bg-accent-secondary/10 border-accent-secondary/25',
    glow: 'from-accent-secondary/10',
    value: 'text-text-primary',
  },
  primary: {
    icon: 'text-accent-primary bg-accent-primary/10 border-accent-primary/25',
    glow: 'from-accent-primary/10',
    value: 'text-text-primary',
  },
  win: {
    icon: 'text-accent-win bg-accent-win/10 border-accent-win/25',
    glow: 'from-accent-win/10',
    value: 'text-text-primary',
  },
  live: {
    icon: 'text-accent-live bg-accent-live/10 border-accent-live/25',
    glow: 'from-accent-live/10',
    value: 'text-text-primary',
  },
  gold: {
    icon: 'text-accent-gold bg-accent-gold/10 border-accent-gold/25',
    glow: 'from-accent-gold/10',
    value: 'text-text-primary',
  },
}

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  accent = 'secondary',
  className,
}: {
  label: string
  value: string | number
  sublabel?: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  accent?: StatAccent
  className?: string
}) {
  const styles = accentStyles[accent]

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border-default/80 bg-bg-surface p-4 sm:p-5',
        'shadow-[var(--shadow-card)] transition-colors hover:border-border-strong',
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b to-transparent opacity-60',
          styles.glow,
        )}
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">{label}</p>
          <p className={cn('mt-2 text-3xl font-bold tabular-nums font-display', styles.value)}>
            {value}
          </p>
          {sublabel ? <p className="mt-1 text-xs text-text-muted">{sublabel}</p> : null}
        </div>
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border',
            styles.icon,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </div>
  )
}
