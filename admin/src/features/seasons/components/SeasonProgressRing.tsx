import type { ComponentType, SVGProps } from 'react'
import { cn } from '@/shared/utils/cn'

export function SeasonProgressRing({
  progress,
  size = 'md',
  icon: Icon,
  className,
}: {
  progress: number
  size?: 'sm' | 'md' | 'lg'
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  className?: string
}) {
  const dimensions = {
    sm: { box: 'h-12 w-12', svg: 'h-12 w-12', r: 20, stroke: 3, icon: 'h-4 w-4', dash: 125.6 },
    md: { box: 'h-16 w-16', svg: 'h-16 w-16', r: 28, stroke: 4, icon: 'h-5 w-5', dash: 175.9 },
    lg: { box: 'h-24 w-24', svg: 'h-24 w-24', r: 42, stroke: 5, icon: 'h-7 w-7', dash: 263.9 },
  }[size]

  const clamped = Math.min(100, Math.max(0, progress))

  return (
    <div className={cn('relative flex items-center justify-center', dimensions.box, className)}>
      <svg className={cn(dimensions.svg, '-rotate-90')} viewBox={`0 0 ${dimensions.r * 2 + 8} ${dimensions.r * 2 + 8}`} aria-hidden="true">
        <circle
          cx={dimensions.r + 4}
          cy={dimensions.r + 4}
          r={dimensions.r}
          fill="none"
          stroke="currentColor"
          strokeWidth={dimensions.stroke}
          className="text-border-default/80"
        />
        <circle
          cx={dimensions.r + 4}
          cy={dimensions.r + 4}
          r={dimensions.r}
          fill="none"
          stroke="currentColor"
          strokeWidth={dimensions.stroke}
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * dimensions.dash} ${dimensions.dash}`}
          className="text-accent-primary transition-[stroke-dasharray] duration-700"
        />
      </svg>
      {Icon ? (
        <Icon className={cn('absolute', dimensions.icon, 'text-accent-primary')} aria-hidden="true" />
      ) : (
        <span className="absolute font-display text-xs font-bold tabular-nums text-text-primary sm:text-sm">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  )
}
