import { BET_SLIP_EMPTY_ICON } from '@/core/constants/branding'
import { ProfileBalanceIcon } from '@/features/profile/components/ProfileBalanceIcon'

interface BetSlipEmptyIconProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function BetSlipEmptyIcon({ size = 'lg', className }: BetSlipEmptyIconProps) {
  return (
    <ProfileBalanceIcon
      src={BET_SLIP_EMPTY_ICON}
      size={size}
      className={className}
    />
  )
}
