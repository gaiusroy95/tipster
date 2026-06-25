import type { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'win' | 'loss'

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border-border-default bg-bg-elevated text-text-muted',
  primary: 'border-accent-primary/30 bg-accent-primary/10 text-accent-primary',
  secondary: 'border-accent-secondary/30 bg-accent-secondary/10 text-accent-secondary',
  win: 'border-accent-win/30 bg-accent-win/10 text-accent-win',
  loss: 'border-accent-loss/30 bg-accent-loss/10 text-accent-loss',
}

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
