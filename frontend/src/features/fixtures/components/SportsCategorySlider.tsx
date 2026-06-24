import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { SPORTS_SLIDER_ITEMS } from '@/core/constants/sportSvgIcons'
import { useFixtureNavParams } from '@/features/fixtures/hooks/useFixtureNavParams'
import { cn } from '@/shared/utils/cn'

export function SportsCategorySlider({ className }: { className?: string }) {
  const { sportId, setSportId } = useFixtureNavParams()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

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
  }, [updateScrollHints])

  const scrollBy = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = Math.max(el.clientWidth * 0.65, 160)
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const arrowBtnClass = (enabled: boolean) =>
    cn(
      'flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full border border-border-default bg-bg-surface shadow-card transition-colors',
      enabled
        ? 'text-text-primary hover:border-border-strong hover:bg-bg-elevated'
        : 'text-text-muted/40 border-border-default/50 cursor-default',
    )

  return (
    <div className={cn('mb-4 flex min-w-0 w-full max-w-full items-center gap-1.5 sm:gap-2', className)}>
      <button
        type="button"
        onClick={() => scrollBy('left')}
        disabled={!canScrollLeft}
        className={arrowBtnClass(canScrollLeft)}
        aria-label="Scroll sports left"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>

      <div
        ref={scrollRef}
        className="horizontal-scroll-strip flex min-w-0 flex-1 gap-2 scroll-snap-x py-0.5"
        role="tablist"
        aria-label="Sport categories"
      >
        {SPORTS_SLIDER_ITEMS.map((sport) => {
          const active = sportId === sport.id
          return (
            <button
              key={sport.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSportId(sport.id)}
              className={cn(
                'flex shrink-0 scroll-snap-item items-center gap-2 rounded-full border px-3.5 py-2 text-sm min-h-[44px] transition-colors',
                active
                  ? 'border-accent-secondary bg-accent-secondary text-white font-semibold shadow-sm'
                  : 'border-border-default bg-bg-surface text-text-muted font-medium hover:border-border-strong hover:text-text-primary',
              )}
            >
              <img
                src={sport.iconSrc}
                alt=""
                className={cn(
                  'h-5 w-5 shrink-0 object-contain',
                  active ? 'brightness-0 invert' : 'opacity-85',
                )}
                loading="lazy"
                decoding="async"
              />
              <span className="whitespace-nowrap">{sport.name}</span>
            </button>
          )
        })}
        <div className="shrink-0 w-2" aria-hidden="true" />
      </div>

      <button
        type="button"
        onClick={() => scrollBy('right')}
        disabled={!canScrollRight}
        className={arrowBtnClass(canScrollRight)}
        aria-label="Scroll sports right"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
