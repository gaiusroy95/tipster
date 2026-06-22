import type { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

export function ProfilePanelCard({
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
    <section className={cn('sidebar-panel overflow-hidden flex flex-col min-h-[280px]', className)}>
      <div className="flex items-start justify-between gap-3 px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-border-default/50">
        <div className="min-w-0">
          <h2 className="font-display text-base font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={cn('flex-1 p-4 sm:p-5', bodyClassName)}>{children}</div>
    </section>
  )
}
