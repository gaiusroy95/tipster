import type { ReactNode } from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { cn } from '@/shared/utils/cn'

interface BettingMarketColumnProps {
  title: string
  rows: 2 | 3
  showInfo?: boolean
  className?: string
  children: ReactNode
}

export function BettingMarketColumn({
  title,
  rows,
  showInfo,
  className,
  children,
}: BettingMarketColumnProps) {
  return (
    <div className={cn('flex flex-col flex-1 min-w-[88px]', className)}>
      <div className="mb-1.5 flex items-center gap-1 px-0.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{title}</span>
        {showInfo && <InformationCircleIcon className="h-3.5 w-3.5 text-text-muted/70" aria-hidden="true" />}
      </div>
      <div
        className={cn(
          'grid flex-1 gap-1',
          rows === 3 ? 'grid-rows-3' : 'grid-rows-2',
        )}
      >
        {children}
      </div>
    </div>
  )
}
