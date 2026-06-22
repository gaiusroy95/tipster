import { getSportIconSrc } from '@/core/constants/sportIcons'
import { cn } from '@/shared/utils/cn'

export function SportCategoryIcon({
  sportId,
  className,
}: {
  sportId: string
  className?: string
}) {
  const src = getSportIconSrc(sportId)

  if (!src) {
    return (
      <span
        className={cn('inline-flex h-4 w-4 shrink-0 items-center justify-center text-text-muted', className)}
        aria-hidden="true"
      >
        ●
      </span>
    )
  }

  return (
    <img
      src={src}
      alt=""
      className={cn('h-4 w-4 shrink-0 object-contain', className)}
      loading="lazy"
      decoding="async"
    />
  )
}
