import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import type { SportsNewsItem } from '@/features/news/types/news'
import { SportsNewsCard } from '@/features/news/components/SportsNewsCard'
import { cn } from '@/shared/utils/cn'

const SECONDS_PER_CARD = 7
const GAP_PX = 16

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

function NewsNavButton({
  direction,
  onClick,
}: {
  direction: 'left' | 'right'
  onClick: () => void
}) {
  const Icon = direction === 'left' ? ChevronLeftIcon : ChevronRightIcon
  return (
    <button
      type="button"
      onClick={(e) => {
        onClick()
        e.currentTarget.blur()
      }}
      className={cn(
        'news-flow-nav absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full',
        'border border-border-default/70 bg-bg-surface/90 text-text-primary shadow-card backdrop-blur-sm',
        'transition-colors hover:border-border-strong hover:bg-bg-elevated',
        direction === 'left' ? 'left-1 sm:left-2' : 'right-1 sm:right-2',
      )}
      aria-label={direction === 'left' ? 'Previous news' : 'Next news'}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  )
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const fadeFrom = surface === 'surface' ? 'from-bg-surface' : 'from-bg-primary'
  const cardWidth = compact
    ? 'w-[min(100%,220px)] sm:w-[200px]'
    : 'w-[min(100%,280px)] sm:w-[240px]'

  const getStep = useCallback(() => {
    const el = scrollRef.current
    if (!el) return 216
    const card = el.querySelector('[data-news-card]') as HTMLElement | null
    if (!card) return 216
    return card.offsetWidth + GAP_PX
  }, [])

  const step = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const stepPx = getStep()
    el.scrollBy({ left: direction === 'left' ? -stepPx : stepPx, behavior: 'smooth' })
  }

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
      <NewsNavButton direction="left" onClick={() => step('left')} />
      <NewsNavButton direction="right" onClick={() => step('right')} />
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scroll-snap-x pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <div key={item.id} data-news-card className={`${cardWidth} shrink-0 scroll-snap-item`}>
            <SportsNewsCard item={item} compact={compact} />
          </div>
        ))}
      </div>
    </div>
  )
}

function AnimatedNewsFlow({
  items,
  compact,
  surface = 'primary',
}: {
  items: SportsNewsItem[]
  compact?: boolean
  surface?: 'primary' | 'surface'
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const nudgeRef = useRef(0)
  const [nudgePx, setNudgePx] = useState(0)
  const [nudgeTransition, setNudgeTransition] = useState(true)
  const flowItems = buildFlowItems(items)
  const flowDuration = Math.max(items.length * SECONDS_PER_CARD, SECONDS_PER_CARD * 2)
  const fadeFrom = surface === 'surface' ? 'from-bg-surface via-bg-surface/80' : 'from-bg-primary via-bg-primary/80'

  const getStep = useCallback(() => {
    const item = trackRef.current?.querySelector('.news-flow-item') as HTMLElement | null
    if (!item) return compact ? 216 : 256
    return item.offsetWidth + GAP_PX
  }, [compact])

  const getCycleWidth = useCallback(() => {
    const track = trackRef.current
    if (track && track.offsetWidth > 0) return track.offsetWidth / 2
    return items.length * getStep()
  }, [items.length, getStep])

  const step = (direction: 'left' | 'right') => {
    const stepPx = getStep()
    const cycleWidth = getCycleWidth()
    let next = direction === 'left' ? nudgeRef.current + stepPx : nudgeRef.current - stepPx
    let wrapped = false

    if (cycleWidth > 0) {
      while (next <= -cycleWidth) {
        next += cycleWidth
        wrapped = true
      }
      while (next >= cycleWidth) {
        next -= cycleWidth
        wrapped = true
      }
    }

    if (wrapped) setNudgeTransition(false)
    nudgeRef.current = next
    setNudgePx(next)
  }

  useLayoutEffect(() => {
    nudgeRef.current = nudgePx
  }, [nudgePx])

  useLayoutEffect(() => {
    if (!nudgeTransition) {
      requestAnimationFrame(() => setNudgeTransition(true))
    }
  }, [nudgePx, nudgeTransition])

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

      <NewsNavButton direction="left" onClick={() => step('left')} />
      <NewsNavButton direction="right" onClick={() => step('right')} />

      {/* Nudge wrapper — CSS animation on inner track keeps flowing like water */}
      <div
        style={{
          transform: `translate3d(${nudgePx}px, 0, 0)`,
          transition: nudgeTransition ? 'transform 0.35s ease' : 'none',
        }}
      >
        <div
          ref={trackRef}
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

  if (prefersReducedMotion) {
    return <StaticNewsScroll items={items} compact={compact} surface={surface} />
  }

  return <AnimatedNewsFlow items={items} compact={compact} surface={surface} />
}
