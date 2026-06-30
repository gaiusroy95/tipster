import { useEffect, useMemo, useState } from 'react'
import { TrophyIcon } from '@heroicons/react/24/outline'
import { isKnownLeagueLogoSrc, resolveLeagueLogoCandidates } from '@/core/constants/leagueLogos'
import { cn } from '@/shared/utils/cn'

const sizeClasses = {
  xs: 'h-6 w-6 rounded-md',
  sm: 'h-8 w-8 rounded-lg',
  md: 'h-10 w-10 rounded-xl',
  lg: 'h-12 w-12 rounded-xl',
} as const

export function LeagueLogo({
  name,
  country,
  logoUrl,
  size = 'sm',
  className,
  iconClassName,
}: {
  name: string
  country?: string
  logoUrl?: string
  size?: keyof typeof sizeClasses
  className?: string
  iconClassName?: string
}) {
  const candidates = useMemo(() => {
    const resolved = resolveLeagueLogoCandidates(name, country)
    const safeLogoUrl = logoUrl && isKnownLeagueLogoSrc(logoUrl) ? logoUrl : undefined
    if (!safeLogoUrl) return resolved
    return [safeLogoUrl, ...resolved.filter((src) => src !== safeLogoUrl)]
  }, [name, country, logoUrl])

  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [candidates])

  const src = candidates[index]
  const imageShellClass = cn(
    'flex shrink-0 items-center justify-center overflow-hidden',
    sizeClasses[size],
    className,
  )

  const fallbackShellClass = cn(
    'flex shrink-0 items-center justify-center overflow-hidden border border-border-default/60 bg-bg-elevated/50',
    sizeClasses[size],
    className,
    iconClassName,
  )

  if (src && index < candidates.length) {
    return (
      <span className={imageShellClass}>
        <img
          src={src}
          alt=""
          className="h-full w-full object-contain"
          onError={() => setIndex((current) => current + 1)}
        />
      </span>
    )
  }

  return (
    <span className={fallbackShellClass}>
      <TrophyIcon className={cn(size === 'xs' ? 'h-3.5 w-3.5' : 'h-5 w-5')} aria-hidden="true" />
    </span>
  )
}
