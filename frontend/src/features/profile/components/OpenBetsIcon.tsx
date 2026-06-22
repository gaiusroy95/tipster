import { BetSlipIcon } from '@/features/betting/components/BetSlipIcon'

interface OpenBetsIconProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function OpenBetsIcon({ size = 'md', className }: OpenBetsIconProps) {
  return <BetSlipIcon size={size} className={className} />
}
