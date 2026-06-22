import { useState, type ReactNode } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { cn } from '@/shared/utils/cn'

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  className,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={cn('rounded-xl border border-border-default/80 bg-bg-elevated/40', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-3 min-h-[44px] text-left text-sm font-semibold text-text-primary hover:bg-bg-elevated/60 transition-colors rounded-xl"
        aria-expanded={open}
      >
        {title}
        <ChevronDownIcon
          className={cn('h-4 w-4 shrink-0 text-text-muted transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="border-t border-border-default/60 px-3 py-3 text-sm text-text-muted">
          {children}
        </div>
      )}
    </div>
  )
}
