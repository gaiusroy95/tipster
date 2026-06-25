import { cn } from '@/shared/utils/cn'

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'A'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

export function UserAvatar({
  name,
  className,
  size = 'md',
}: {
  name: string
  className?: string
  size?: 'sm' | 'md'
}) {
  const sizeClass = size === 'sm' ? 'h-9 w-9 text-xs' : 'h-10 w-10 text-sm'

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl border border-accent-secondary/30',
        'bg-gradient-to-br from-accent-secondary/25 to-accent-primary/15 font-semibold text-text-primary',
        sizeClass,
        className,
      )}
      aria-hidden="true"
    >
      {initialsFromName(name)}
    </div>
  )
}
