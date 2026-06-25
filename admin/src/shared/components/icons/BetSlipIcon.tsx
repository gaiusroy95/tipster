import { InboxStackIcon } from '@heroicons/react/24/outline'
import type { SVGProps } from 'react'
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

/** Same bet-slip icon as frontend BetSlipChatPanel — InboxStackIcon with size presets. */
export function BetSlipIcon({ size = 'md', className }: BetSlipIconProps) {
  return (
    <InboxStackIcon
      className={cn('shrink-0', sizes[size], className)}
      aria-hidden="true"
    />
  )
}

/** Nav / metric slots that pass className only (e.g. h-[18px] w-[18px]). */
export function BetSlipNavIcon({ className }: SVGProps<SVGSVGElement>) {
  return <BetSlipIcon size="sm" className={className} />
}
