import { cn } from '@/shared/utils/cn'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg bg-gradient-to-r from-bg-elevated via-bg-elevated/70 to-bg-elevated',
        'animate-pulse motion-reduce:animate-none',
        className,
      )}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-4 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}
