import { useSearchParams } from 'react-router-dom'
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

  return (
    <nav
      className="sidebar-panel overflow-hidden"
      aria-label="Profile sections"
      role="tablist"
    >
      <div className="flex overflow-x-auto horizontal-scroll-strip border-b border-border-default/80">
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
              <span className="hidden sm:inline">{tab.label}</span>
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
    </nav>
  )
}
