import type { ReactNode } from 'react'
import type { ComponentType, SVGProps } from 'react'
import { cn } from '@/shared/utils/cn'

export function LegalSection({
  id,
  index,
  title,
  children,
  icon: Icon,
}: {
  id: string
  index: number
  title: string
  children: ReactNode
  icon?: ComponentType<SVGProps<SVGSVGElement>>
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="flex items-start gap-3 sm:gap-4 mb-4">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent-secondary/25 bg-accent-secondary/10 font-mono text-xs font-bold text-accent-secondary"
          aria-hidden="true"
        >
          {String(index).padStart(2, '0')}
        </span>
        <div className="min-w-0 pt-0.5">
          <h2 className="font-display text-lg sm:text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-accent-secondary shrink-0" aria-hidden="true" />}
            {title}
          </h2>
        </div>
      </div>
      <div className={cn('space-y-4 text-sm sm:text-[15px] text-text-muted leading-relaxed pl-0 sm:pl-12')}>
        {children}
      </div>
    </section>
  )
}
