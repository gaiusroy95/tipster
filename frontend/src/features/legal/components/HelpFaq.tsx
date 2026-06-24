import type { ReactNode } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { cn } from '@/shared/utils/cn'

export function HelpFaqList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('space-y-2 not-prose', className)}>{children}</div>
}

export function HelpFaqItem({ question, children }: { question: string; children: ReactNode }) {
  return (
    <details className="group rounded-xl border border-border-default/70 bg-bg-elevated/30 open:border-accent-secondary/30 open:bg-bg-elevated/50">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-semibold text-text-primary [&::-webkit-details-marker]:hidden">
        {question}
        <ChevronDownIcon
          className="h-4 w-4 shrink-0 text-text-muted transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="border-t border-border-default/50 px-4 pb-4 pt-3 text-sm text-text-muted leading-relaxed">
        {children}
      </div>
    </details>
  )
}
