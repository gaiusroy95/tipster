import { useEffect, useState } from 'react'
import { cn } from '@/shared/utils/cn'

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'A'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

function normalizeGoogleAvatarUrl(url: string) {
  if (!url.includes('googleusercontent.com')) return url
  const base = url.replace(/=s\d+(-c)?$/, '')
  return `${base}=s256-c`
}

const sizeClasses = {
  sm: 'h-9 w-9 text-xs rounded-xl',
  md: 'h-10 w-10 text-sm rounded-xl',
  lg: 'h-16 w-16 text-base rounded-2xl',
  xl: 'h-24 w-24 text-xl rounded-2xl sm:h-28 sm:w-28 sm:text-2xl',
} as const

export function UserAvatar({
  name,
  avatarUrl,
  className,
  size = 'md',
}: {
  name: string
  avatarUrl?: string
  className?: string
  size?: keyof typeof sizeClasses
}) {
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [avatarUrl])

  const src = avatarUrl ? normalizeGoogleAvatarUrl(avatarUrl) : undefined
  const sizeClass = sizeClasses[size]

  if (src && !imageFailed) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        className={cn(
          'shrink-0 object-cover border border-accent-secondary/30 shadow-[0_0_24px_rgba(99,102,241,0.15)]',
          sizeClass,
          className,
        )}
        onError={() => setImageFailed(true)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center border border-accent-secondary/30 font-semibold text-text-primary',
        'bg-gradient-to-br from-accent-secondary/25 to-accent-primary/15',
        sizeClass,
        className,
      )}
      aria-label={name}
    >
      {initialsFromName(name)}
    </div>
  )
}
