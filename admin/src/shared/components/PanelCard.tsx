import type { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

export function PanelCard({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border border-border-default/80 bg-bg-surface shadow-[var(--shadow-card)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border-default/60 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <h2 className="font-display text-base font-bold tracking-tight">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className={cn('p-4 sm:p-5', bodyClassName)}>{children}</div>
    </section>
  )
}
