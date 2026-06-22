import { type ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface PageShellProps {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function PageShell({ title, description, action, children, className }: PageShellProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  )
}
