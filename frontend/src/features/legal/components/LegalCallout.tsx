import type { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

export type LegalCalloutVariant = 'info' | 'warning' | 'accent'

const variantStyles: Record<LegalCalloutVariant, string> = {
  info: 'border-accent-secondary/30 bg-accent-secondary/5',
  warning: 'border-accent-primary/30 bg-accent-primary/5',
  accent: 'border-accent-gold/30 bg-accent-gold/5',
}

export function LegalCallout({
  title,
  children,
  variant = 'info',
}: {
  title?: string
  children: ReactNode
  variant?: LegalCalloutVariant
}) {
  return (
    <aside
      className={cn(
        'rounded-xl border px-4 py-3.5 sm:px-5 sm:py-4 text-sm leading-relaxed text-text-muted',
        variantStyles[variant],
      )}
    >
      {title && <p className="mb-1.5 font-semibold text-text-primary">{title}</p>}
      {children}
    </aside>
  )
}
