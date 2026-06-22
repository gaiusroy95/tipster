import { InboxStackIcon } from '@heroicons/react/24/outline'
import { cn } from '@/shared/utils/cn'

interface BetSlipIconProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
} as const

export function BetSlipIcon({ size = 'md', className }: BetSlipIconProps) {
  return (
    <InboxStackIcon
      className={cn('shrink-0 text-accent-secondary', sizes[size], className)}
      aria-hidden="true"
    />
  )
}
