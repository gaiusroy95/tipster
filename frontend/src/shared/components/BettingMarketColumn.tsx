import { Children, type ReactNode } from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { cn } from '@/shared/utils/cn'

interface BettingMarketColumnProps {
  title: string
  showInfo?: boolean
  className?: string
  children: ReactNode
}

export function BettingMarketColumn({
  title,
  showInfo,
  className,
  children,
}: BettingMarketColumnProps) {
  const childCount = Children.count(children)
  const rowCount = childCount >= 3 ? 3 : 2

  return (
    <div className={cn('flex flex-col flex-1 min-w-[88px] self-stretch', className)}>
      <div className="mb-1.5 flex shrink-0 items-center gap-1 px-0.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{title}</span>
        {showInfo && <InformationCircleIcon className="h-3.5 w-3.5 text-text-muted/70" aria-hidden="true" />}
      </div>
      <div
        className={cn(
          'grid min-h-0 flex-1 gap-1',
          rowCount === 3 ? 'grid-rows-3' : 'grid-rows-2',
        )}
      >
        {children}
      </div>
    </div>
  )
}
