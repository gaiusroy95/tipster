import { useEffect, useMemo, useState } from 'react'
import { getCountryFlagSrc, resolveTeamCountryFlagFile } from '@/core/constants/leagueLogos'
import { cn } from '@/shared/utils/cn'

const sizeClasses = {
  xs: 'h-6 w-6 min-w-6 rounded-full text-[10px]',
  sm: 'h-8 w-8 min-w-8 rounded-full text-[11px]',
  md: 'h-10 w-10 min-w-10 rounded-full text-xs',
  lg: 'h-14 w-14 min-w-14 rounded-full text-sm sm:h-16 sm:w-16 sm:min-w-16 sm:text-base',
} as const

export function TeamCountryBadge({
  teamName,
  shortName,
  logoUrl,
  side = 'home',
  size = 'sm',
  className,
}: {
  teamName: string
  shortName: string
  logoUrl?: string
  side?: 'home' | 'away'
  size?: keyof typeof sizeClasses
  className?: string
}) {
  const candidates = useMemo(() => {
    const list: string[] = []
    if (logoUrl) list.push(logoUrl)
    const flagFile = resolveTeamCountryFlagFile(teamName)
    if (flagFile) {
      const flagSrc = getCountryFlagSrc(flagFile)
      if (!list.includes(flagSrc)) list.push(flagSrc)
    }
    return list
  }, [teamName, logoUrl])

  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [candidates])

  const src = candidates[index]
  const shellClass = cn(
    'flex shrink-0 items-center justify-center overflow-hidden font-mono font-bold aspect-square',
    sizeClasses[size],
    className,
  )

  const fallbackClass = cn(
    shellClass,
    'border ring-1 ring-border-default/60',
    side === 'home'
      ? 'border-accent-secondary/30 bg-accent-secondary/10 text-accent-secondary'
      : 'border-accent-primary/25 bg-accent-primary/10 text-accent-primary',
  )

  if (src && index < candidates.length) {
    return (
      <span className={cn(shellClass, 'bg-bg-elevated/40 ring-1 ring-border-default/50')}>
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover object-center"
          onError={() => setIndex((current) => current + 1)}
        />
      </span>
    )
  }

  return (
    <span className={fallbackClass} aria-hidden="true">
      {shortName}
    </span>
  )
}
