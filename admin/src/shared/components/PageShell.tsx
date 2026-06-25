import type { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

export function PageShell({
  title,
  description,
  badge,
  action,
  children,
  className,
}: {
  title: string
  description?: string
  badge?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mx-auto w-full max-w-7xl space-y-6', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-display font-bold tracking-tight sm:text-3xl">{title}</h1>
            {badge}
          </div>
          {description ? <p className="text-sm text-text-muted">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </div>
  )
}
