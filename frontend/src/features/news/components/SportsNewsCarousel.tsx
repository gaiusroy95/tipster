import { useEffect, useState, type CSSProperties } from 'react'
import type { SportsNewsItem } from '@/features/news/types/news'
import { SportsNewsCard } from '@/features/news/components/SportsNewsCard'
import { cn } from '@/shared/utils/cn'

const SECONDS_PER_CARD = 7

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}

function buildFlowItems(items: SportsNewsItem[]): SportsNewsItem[] {
  if (items.length === 0) return []
  if (items.length === 1) {
    return Array.from({ length: 8 }, (_, i) => ({
      ...items[0],
      id: `${items[0].id}-flow-${i}`,
    }))
  }
  return [...items, ...items]
}

function StaticNewsScroll({
  items,
  compact,
  surface = 'primary',
}: {
  items: SportsNewsItem[]
  compact?: boolean
  surface?: 'primary' | 'surface'
}) {
  const cardWidth = compact ? 'w-[min(100%,220px)] sm:w-[200px]' : 'w-[min(100%,280px)] sm:w-[240px]'
  const fadeFrom = surface === 'surface' ? 'from-bg-surface' : 'from-bg-primary'

  return (
    <div className="relative overflow-hidden">
      <div
        className={cn('pointer-events-none absolute inset-y-0 left-0 z-[5] w-6 bg-gradient-to-r to-transparent', fadeFrom)}
        aria-hidden="true"
      />
      <div
        className={cn('pointer-events-none absolute inset-y-0 right-0 z-[5] w-6 bg-gradient-to-l to-transparent', fadeFrom)}
        aria-hidden="true"
      />
      <div
        className="flex gap-3 overflow-x-auto scroll-snap-x pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <div key={item.id} className={`${cardWidth} shrink-0 scroll-snap-item`}>
            <SportsNewsCard item={item} compact={compact} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SportsNewsCarousel({
  items,
  compact = false,
  surface = 'primary',
}: {
  items: SportsNewsItem[]
  compact?: boolean
  surface?: 'primary' | 'surface'
}) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const flowItems = buildFlowItems(items)
  const flowDuration = Math.max(items.length * SECONDS_PER_CARD, SECONDS_PER_CARD * 2)
  const fadeFrom = surface === 'surface' ? 'from-bg-surface via-bg-surface/80' : 'from-bg-primary via-bg-primary/80'

  if (prefersReducedMotion) {
    return <StaticNewsScroll items={items} compact={compact} surface={surface} />
  }

  return (
    <div className={cn('news-flow relative overflow-hidden', compact && 'news-flow-compact')}>
      <div
        className={cn('pointer-events-none absolute inset-y-0 left-0 z-[5] w-12 bg-gradient-to-r to-transparent', fadeFrom)}
        aria-hidden="true"
      />
      <div
        className={cn('pointer-events-none absolute inset-y-0 right-0 z-[5] w-12 bg-gradient-to-l to-transparent', fadeFrom)}
        aria-hidden="true"
      />

      <div
        className="news-flow-track"
        style={{ '--news-flow-duration': `${flowDuration}s` } as CSSProperties}
      >
        {flowItems.map((item, index) => (
          <div key={`${item.id}-${index}`} className="news-flow-item">
            <SportsNewsCard item={item} compact={compact} />
          </div>
        ))}
      </div>
    </div>
  )
}
