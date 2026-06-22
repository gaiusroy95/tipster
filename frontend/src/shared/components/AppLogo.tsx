import { cn } from '@/shared/utils/cn'
import { LOGO_ALT, LOGO_SRC } from '@/core/constants/branding'

type AppLogoSize = 'sm' | 'md' | 'sidebar' | 'lg'

const sizeClasses: Record<AppLogoSize, string> = {
  sm: 'h-13 w-auto max-w-[130px]',
  md: 'h-10 sm:h-11 w-auto max-w-[150px] sm:max-w-[170px]',
  sidebar: 'h-15 w-auto max-w-[min(82vw,220px)]',
  lg: 'h-32 sm:h-40 w-auto max-w-[min(92vw,400px)]',
}

export function AppLogo({
  size = 'md',
  className,
}: {
  size?: AppLogoSize
  className?: string
}) {
  return (
    <img
      src={LOGO_SRC}
      alt={LOGO_ALT}
      className={cn('object-contain object-left shrink-0', sizeClasses[size], className)}
      decoding="async"
    />
  )
}
