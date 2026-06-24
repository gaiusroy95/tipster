import { type ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface PageShellProps {
  title?: string
  description?: string
  header?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function PageShell({ title, description, header, action, children, className }: PageShellProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {header ?? (
        title ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
          </div>
        ) : null
      )}
      {children}
    </div>
  )
}
