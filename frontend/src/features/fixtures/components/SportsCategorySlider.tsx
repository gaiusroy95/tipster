import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { SPORTS_SLIDER_ITEMS } from '@/core/constants/sportSvgIcons'
import { useCuratedSportCategories } from '@/features/fixtures/hooks/useFixtures'
import { useFixtureNavParams } from '@/features/fixtures/hooks/useFixtureNavParams'
import { cn } from '@/shared/utils/cn'

interface SportsCategorySliderProps {
  className?: string
  /** Compact embedded style for matches discovery header */
  variant?: 'default' | 'compact'
}

export function SportsCategorySlider({
  className,
  variant = 'default',
}: SportsCategorySliderProps) {
  const { sportId, setSportId } = useFixtureNavParams()
  const sportCategories = useCuratedSportCategories()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const visibleItems = useMemo(() => {
    const allowed = new Set(sportCategories.data?.map((sport) => sport.id) ?? [])
    if (allowed.size === 0) return SPORTS_SLIDER_ITEMS
    return SPORTS_SLIDER_ITEMS.filter((item) => allowed.has(item.id))
  }, [sportCategories.data])

  useEffect(() => {
    if (visibleItems.length === 0) return
    if (!visibleItems.some((item) => item.id === sportId)) {
      setSportId(visibleItems[0]!.id)
    }
  }, [visibleItems, sportId, setSportId])

  const isCompact = variant === 'compact'

  const updateScrollHints = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(maxScroll > 4 && el.scrollLeft < maxScroll - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    updateScrollHints()

    el.addEventListener('scroll', updateScrollHints, { passive: true })
    const ro = new ResizeObserver(updateScrollHints)
    ro.observe(el)

    return () => {
      el.removeEventListener('scroll', updateScrollHints)
      ro.disconnect()
    }
  }, [updateScrollHints, visibleItems.length])

  const scrollBy = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = Math.max(el.clientWidth * 0.65, 160)
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const arrowBtnClass = (enabled: boolean) =>
    cn(
      'flex shrink-0 items-center justify-center self-center rounded-full border transition-colors',
      isCompact ? 'h-8 w-8' : 'h-9 w-9',
      isCompact
        ? 'border-border-default/60 bg-bg-surface/80 text-text-muted hover:text-text-primary hover:bg-bg-elevated'
        : 'border-border-default bg-bg-surface shadow-card',
      enabled
        ? isCompact
          ? 'hover:border-border-strong'
          : 'text-text-primary hover:border-border-strong hover:bg-bg-elevated'
        : 'text-text-muted/40 border-border-default/50 cursor-default opacity-50',
    )

  const pillClass = (active: boolean) =>
    cn(
      'flex shrink-0 scroll-snap-item items-center gap-2 rounded-full border transition-all duration-200',
      isCompact
        ? 'px-3 py-1.5 text-xs min-h-[36px]'
        : 'px-3.5 py-2 text-sm min-h-[44px]',
      active
        ? isCompact
          ? 'border-accent-secondary/60 bg-accent-secondary/15 text-text-primary font-semibold ring-1 ring-accent-secondary/25'
          : 'border-accent-secondary bg-accent-secondary text-white font-semibold shadow-sm'
        : isCompact
          ? 'border-border-default/60 bg-bg-surface/40 text-text-muted font-medium hover:border-border-strong hover:text-text-primary'
          : 'border-border-default bg-bg-surface text-text-muted font-medium hover:border-border-strong hover:text-text-primary',
    )

  const iconClass = (active: boolean) =>
    cn(
      'shrink-0 object-contain',
      isCompact ? 'h-4 w-4' : 'h-5 w-5',
      active && !isCompact ? 'brightness-0 invert' : 'opacity-80',
      active && isCompact && 'opacity-100',
    )

  return (
    <div
      className={cn(
        'flex min-w-0 w-full max-w-full items-center',
        isCompact ? 'gap-1' : 'gap-1.5 sm:gap-2 mb-4',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => scrollBy('left')}
        disabled={!canScrollLeft}
        className={cn(arrowBtnClass(canScrollLeft), isCompact && 'max-lg:hidden')}
        aria-label="Scroll sports left"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>

      <div className={cn('relative min-w-0 flex-1', isCompact && 'max-lg:mx-0')}>
        {isCompact && canScrollLeft && (
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-bg-surface to-transparent"
            aria-hidden="true"
          />
        )}
        {isCompact && canScrollRight && (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-bg-surface to-transparent"
            aria-hidden="true"
          />
        )}

        <div
          ref={scrollRef}
          className={cn(
            'sports-category-scroll horizontal-scroll-strip flex min-w-0 gap-1.5 scroll-snap-x',
            isCompact ? 'py-0.5 px-0.5' : 'flex-1 gap-2 py-0.5',
          )}
          role="tablist"
          aria-label="Sport categories"
        >
          {visibleItems.map((sport) => {
            const active = sportId === sport.id
            return (
              <button
                key={sport.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSportId(sport.id)}
                className={pillClass(active)}
              >
                <img
                  src={sport.iconSrc}
                  alt=""
                  className={iconClass(active)}
                  loading="lazy"
                  decoding="async"
                />
                <span className="whitespace-nowrap">{sport.name}</span>
              </button>
            )
          })}
          <div className="shrink-0 w-3" aria-hidden="true" />
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollBy('right')}
        disabled={!canScrollRight}
        className={cn(arrowBtnClass(canScrollRight), isCompact && 'max-lg:hidden')}
        aria-label="Scroll sports right"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
