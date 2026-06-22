import { PROFILE_ICON_OPEN_BETS } from '@/core/constants/branding'
import { ProfileBalanceIcon } from '@/features/profile/components/ProfileBalanceIcon'

interface OpenBetsIconProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function OpenBetsIcon({ size = 'md', className }: OpenBetsIconProps) {
  return (
    <ProfileBalanceIcon
      src={PROFILE_ICON_OPEN_BETS}
      size={size === 'lg' ? 'lg' : size}
      className={className}
      alt=""
    />
  )
}
