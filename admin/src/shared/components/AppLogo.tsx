import { cn } from '@/shared/utils/cn'
import { LOGO_ALT, LOGO_MARK_SRC, LOGO_SRC } from '@/core/constants/branding'

type AppLogoSize = 'sm' | 'md' | 'lg' | 'splash'
type AppLogoVariant = 'full' | 'mark'

const fullSizeClasses: Record<AppLogoSize, string> = {
  sm: 'h-8 w-auto max-w-[140px]',
  md: 'h-10 w-auto max-w-[160px]',
  lg: 'h-14 w-auto max-w-[200px]',
  splash: 'h-24 w-auto max-w-[min(88vw,360px)] sm:h-28 sm:max-w-[min(90vw,400px)] md:h-32',
}

const markSizeClasses: Record<AppLogoSize, string> = {
  sm: 'h-8 w-auto max-w-[40px]',
  md: 'h-10 w-auto max-w-[48px]',
  lg: 'h-14 w-auto max-w-[64px]',
  splash: 'h-20 w-auto max-w-[min(40vw,120px)] sm:h-24 sm:max-w-[min(44vw,140px)]',
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
      className={cn('object-contain shrink-0', sizeClass, className)}
      decoding="async"
    />
  )
}
