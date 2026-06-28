import { Skeleton } from '@/shared/components/ui/Skeleton'
import { cn } from '@/shared/utils/cn'

function OddsColumnSkeleton() {
  return (
    <div className="min-w-0 flex-1 basis-0 space-y-1.5">
      <Skeleton className="h-3 w-12" />
      <div className="grid gap-1.5">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  )
}

export function MatchFixtureCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <article
      className={cn(
        'overflow-hidden rounded-lg border bg-bg-surface',
        featured ? 'border-accent-primary/30 ring-1 ring-accent-primary/10' : 'border-border-default/80',
      )}
      aria-hidden="true"
    >
      <div className="flex min-w-0 flex-col xl:flex-row xl:items-stretch">
        <div className="min-w-0 flex-1 p-3.5 xl:p-4 space-y-3">
          {featured && <Skeleton className="h-5 w-20 rounded-md" />}

          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded shrink-0" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-4 w-36" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full shrink-0" />
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="space-y-1.5 text-center">
              <Skeleton className="h-3 w-10 mx-auto" />
              <Skeleton className="h-4 w-full max-w-[120px] mx-auto" />
            </div>
            <Skeleton className="h-4 w-8 shrink-0" />
            <div className="space-y-1.5 text-center">
              <Skeleton className="h-3 w-10 mx-auto" />
              <Skeleton className="h-4 w-full max-w-[120px] mx-auto" />
            </div>
          </div>

          <div className="hidden xl:flex gap-2 pt-1">
            <OddsColumnSkeleton />
            <OddsColumnSkeleton />
            <OddsColumnSkeleton />
          </div>

          <div className="xl:hidden space-y-2">
            <Skeleton className="h-3 w-14" />
            <div className="grid grid-cols-3 gap-1.5">
              <Skeleton className="h-12 rounded-md" />
              <Skeleton className="h-12 rounded-md" />
              <Skeleton className="h-12 rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
            </div>
          </div>
        </div>

        <div className="hidden xl:flex shrink-0 flex-col items-center justify-between gap-2 border-t border-border-default/50 px-2 py-4 xl:w-[80px] xl:min-w-[80px] xl:border-t-0 xl:border-l">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>

      <div className="border-t border-border-default/50 bg-bg-elevated/20 px-3 py-2.5 hidden sm:flex items-center justify-between gap-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
    </article>
  )
}

export function MatchFixtureListSkeleton({
  count = 3,
  featuredFirst = false,
}: {
  count?: number
  featuredFirst?: boolean
}) {
  return (
    <div className="space-y-3 p-2" aria-busy="true" aria-label="Loading matches">
      {Array.from({ length: count }).map((_, i) => (
        <MatchFixtureCardSkeleton key={i} featured={featuredFirst && i === 0} />
      ))}
    </div>
  )
}
