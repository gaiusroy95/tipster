import { useSportsNews } from '@/features/news/hooks/useSportsNews'
import { SportsNewsCarousel } from '@/features/news/components/SportsNewsCarousel'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { EmptyState } from '@/shared/components/EmptyState'

interface SportsNewsSectionProps {
  variant?: 'default' | 'embedded'
}

export function SportsNewsSection({ variant = 'default' }: SportsNewsSectionProps) {
  const news = useSportsNews({ sport: 'soccer', limit: 10 })
  const embedded = variant === 'embedded'

  const header = (
    <h2 className="font-display text-sm font-semibold text-text-primary mb-3">Sport News</h2>
  )

  const carouselProps = {
    compact: embedded,
    surface: embedded ? 'surface' as const : 'primary' as const,
  }

  if (news.isPending && !news.data) {
    return (
      <section
        className={embedded ? 'px-4 py-4 sm:px-6' : 'mb-6'}
        aria-label="Sport news"
      >
        {header}
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[168px] w-[200px] shrink-0 rounded-xl" />
          ))}
        </div>
      </section>
    )
  }

  if (news.isError) {
    return (
      <section
        className={embedded ? 'px-4 py-4 sm:px-6' : 'mb-6 glass-panel rounded-2xl p-4'}
        aria-label="Sport news"
      >
        {header}
        <QueryErrorFallback onRetry={() => news.refetch()} />
      </section>
    )
  }

  if (!news.data?.items.length) {
    return (
      <section
        className={embedded ? 'px-4 py-4 sm:px-6' : 'mb-6 glass-panel rounded-2xl p-4'}
        aria-label="Sport news"
      >
        {header}
        <EmptyState title="No news available" description="Check back later for the latest headlines." />
      </section>
    )
  }

  return (
    <section
      className={embedded ? 'px-4 py-4 sm:px-6' : 'mb-6'}
      aria-label="Sport news"
    >
      {header}
      <SportsNewsCarousel items={news.data.items} {...carouselProps} />
    </section>
  )
}
