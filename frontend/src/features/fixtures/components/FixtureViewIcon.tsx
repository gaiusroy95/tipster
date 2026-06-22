import { getFixtureViewIconSrc } from '@/core/constants/sportIcons'
import type { FixtureView } from '@/core/constants/sports'
import { cn } from '@/shared/utils/cn'

export function FixtureViewIcon({
  view,
  className,
}: {
  view: FixtureView
  className?: string
}) {
  const src = getFixtureViewIconSrc(view)

  return (
    <img
      src={src}
      alt=""
      className={cn('h-4 w-4 shrink-0 object-contain opacity-80', className)}
      loading="lazy"
      decoding="async"
    />
  )
}
