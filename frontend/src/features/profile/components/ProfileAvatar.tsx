import { useEffect, useState } from 'react'
import { cn } from '@/shared/utils/cn'

function normalizeGoogleAvatarUrl(url: string): string {
  if (!url.includes('googleusercontent.com')) return url
  const base = url.replace(/=s\d+(-c)?$/, '')
  return `${base}=s256-c`
}

export function ProfileAvatar({
  name,
  avatarUrl,
  className,
}: {
  name: string
  avatarUrl?: string
  className?: string
}) {
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [avatarUrl])

  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const src = avatarUrl ? normalizeGoogleAvatarUrl(avatarUrl) : undefined

  if (src && !imageFailed) {
    return (
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        className={cn('rounded-full object-cover shrink-0 ring-2 ring-border-default', className)}
        onError={() => setImageFailed(true)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-accent-secondary to-accent-primary font-display font-bold text-bg-primary shrink-0 ring-2 ring-accent-secondary/30',
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}
