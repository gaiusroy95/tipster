import { cn } from '@/shared/utils/cn'

export function ProfileAvatar({
  name,
  avatarUrl,
  className,
}: {
  name: string
  avatarUrl?: string
  className?: string
}) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={cn('rounded-full object-cover shrink-0 ring-2 ring-border-default', className)}
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
