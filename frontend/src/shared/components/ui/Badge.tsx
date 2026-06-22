import { type HTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'

type BadgeVariant = 'default' | 'live' | 'win' | 'loss' | 'gold' | 'muted'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-bg-elevated text-text-primary border-border-default',
  live: 'bg-accent-live/20 text-accent-live border-accent-live/30',
  win: 'bg-accent-win/20 text-accent-win border-accent-win/30',
  loss: 'bg-accent-loss/20 text-accent-loss border-accent-loss/30',
  gold: 'bg-accent-gold/20 text-accent-gold border-accent-gold/30',
  muted: 'bg-bg-elevated text-text-muted border-border-default',
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
