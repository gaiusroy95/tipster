import { cn } from '@/shared/utils/cn'
import { LOGO_ALT, LOGO_MARK_SRC, LOGO_SRC } from '@/core/constants/branding'

type AppLogoSize = 'sm' | 'md' | 'lg'
type AppLogoVariant = 'full' | 'mark'

const fullSizeClasses: Record<AppLogoSize, string> = {
  sm: 'h-8 w-auto max-w-[140px]',
  md: 'h-10 w-auto max-w-[160px]',
  lg: 'h-14 w-auto max-w-[200px]',
}

const markSizeClasses: Record<AppLogoSize, string> = {
  sm: 'h-8 w-auto max-w-[40px]',
  md: 'h-10 w-auto max-w-[48px]',
  lg: 'h-14 w-auto max-w-[64px]',
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
