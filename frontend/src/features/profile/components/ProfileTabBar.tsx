import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { cn } from '@/shared/utils/cn'

export const PROFILE_TABS = [
  { id: 'overview', label: 'Overview', shortLabel: 'Overview' },
  { id: 'open-bets', label: 'Open bets', shortLabel: 'Open' },
  { id: 'history', label: 'Bet history', shortLabel: 'History' },
  { id: 'season', label: 'Season history', shortLabel: 'Season' },
  { id: 'achievements', label: 'Achievements', shortLabel: 'Awards' },
  { id: 'social', label: 'Followers & following', shortLabel: 'Social' },
] as const

export type ProfileTabId = (typeof PROFILE_TABS)[number]['id']

export function useProfileTab(): ProfileTabId {
  const [params] = useSearchParams()
  const tab = params.get('tab')
  if (PROFILE_TABS.some((t) => t.id === tab)) return tab as ProfileTabId
  return 'overview'
}

export function ProfileTabBar() {
  const [params, setParams] = useSearchParams()
  const active = useProfileTab()
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

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const activeTab = el.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
    activeTab?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' })
    requestAnimationFrame(updateScrollHints)
  }, [active, updateScrollHints])

  const scrollBy = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = Math.max(el.clientWidth * 0.65, 160)
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const arrowBtnClass = (enabled: boolean) =>
    cn(
      'flex shrink-0 items-center justify-center w-9 min-h-[48px] border-b border-border-default/80 transition-colors',
      enabled
        ? 'text-text-muted hover:text-text-primary hover:bg-bg-elevated/40'
        : 'text-text-muted/30 cursor-default',
    )

  return (
    <nav className="sidebar-panel overflow-hidden" aria-label="Profile sections">
      <div className="flex min-w-0 items-stretch">
        <button
          type="button"
          onClick={() => scrollBy('left')}
          disabled={!canScrollLeft}
          className={arrowBtnClass(canScrollLeft)}
          aria-label="Scroll profile tabs left"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        <div
          ref={scrollRef}
          role="tablist"
          className="profile-tabs-scroll horizontal-scroll-strip flex min-w-0 flex-1 border-b border-border-default/80"
        >
          {PROFILE_TABS.map((tab) => {
            const isActive = active === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  const next = new URLSearchParams(params)
                  next.set('tab', tab.id)
                  setParams(next, { replace: true })
                }}
                className={cn(
                  'relative shrink-0 px-4 sm:px-5 py-3.5 min-h-[48px] text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-colors',
                  'border-b-2 -mb-px',
                  isActive
                    ? 'border-accent-secondary text-accent-secondary bg-accent-secondary/5'
                    : 'border-transparent text-text-muted hover:text-text-primary hover:bg-bg-elevated/40',
                )}
              >
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline whitespace-nowrap">{tab.label}</span>
                {isActive && (
                  <span
                    className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-secondary/50 to-transparent sm:inset-x-5"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => scrollBy('right')}
          disabled={!canScrollRight}
          className={arrowBtnClass(canScrollRight)}
          aria-label="Scroll profile tabs right"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </nav>
  )
}
