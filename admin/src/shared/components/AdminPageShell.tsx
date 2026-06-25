import type { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

/** Full-width page frame on lg+; mobile layout unchanged. */
export function AdminPageShell({
  children,
  className,
  compact,
}: {
  children: ReactNode
  className?: string
  /** Slightly tighter vertical rhythm (forum, audit). */
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'admin-page-shell mx-auto w-full',
        compact ? 'space-y-5 sm:space-y-6' : 'space-y-6',
        className,
      )}
    >
      {children}
    </div>
  )
}
