import { cn } from '@/shared/utils/cn'
import { LOGO_ALT, LOGO_MARK_SRC, LOGO_SRC } from '@/core/constants/branding'

type AppLogoSize = 'sm' | 'md' | 'sidebar' | 'lg'
type AppLogoVariant = 'full' | 'mark'

const fullSizeClasses: Record<AppLogoSize, string> = {
  sm: 'h-13 w-auto max-w-[170px]',
  md: 'h-10 sm:h-11 w-auto max-w-[150px] sm:max-w-[170px]',
  sidebar: 'h-15 w-auto max-w-[min(82vw,220px)]',
  lg: 'h-25 sm:h-30 w-auto max-w-[min(92vw,400px)]',
}

const markSizeClasses: Record<AppLogoSize, string> = {
  sm: 'h-9 w-auto max-w-[48px]',
  md: 'h-10 sm:h-11 w-auto max-w-[56px]',
  sidebar: 'h-14 w-auto max-w-[72px]',
  lg: 'h-20 sm:h-24 w-auto max-w-[min(72vw,160px)]',
}

export function AppLogo({
  size = 'md',
  variant = 'full',
  className,
}: {
  size?: AppLogoSize
  variant?: AppLogoVariant
  className?: string
}) {
  const src = variant === 'mark' ? LOGO_MARK_SRC : LOGO_SRC
  const sizeClass = variant === 'mark' ? markSizeClasses[size] : fullSizeClasses[size]

  return (
    <img
      src={src}
      alt={LOGO_ALT}
      className={cn(
        'object-contain shrink-0',
        variant === 'mark' ? 'object-center' : 'object-left',
        sizeClass,
        className,
      )}
      decoding="async"
    />
  )
}
