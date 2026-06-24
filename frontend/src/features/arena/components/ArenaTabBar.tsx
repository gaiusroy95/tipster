import { useSearchParams } from 'react-router-dom'
import { cn } from '@/shared/utils/cn'
import { useBetSlipStore } from '@/features/betting/stores/betSlipStore'
import { Badge } from '@/shared/components/ui/Badge'

const tabs = [
  { id: 'cup', label: 'Tipster Cup', shortLabel: 'Cup' },
  { id: 'leaderboard', label: 'Leaderboard', shortLabel: 'Board' },
  { id: 'rewards', label: 'Rewards', shortLabel: 'Rewards' },
  { id: 'achievements', label: 'Achievements', shortLabel: 'Badges' },
  { id: 'results', label: 'Past Results', shortLabel: 'Results' },
] as const

export type ArenaTabId = (typeof tabs)[number]['id']

export function ArenaTabBar({ className }: { className?: string }) {
  const [params, setParams] = useSearchParams()
  const active = (params.get('tab') as ArenaTabId) || 'cup'
  const slipCount = useBetSlipStore((s) => s.selections.length)

  return (
    <div className={cn('border-b border-border-default mb-5', className)}>
      <nav
        className={cn(
          'flex gap-1 overflow-x-auto scroll-snap-x',
          '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
        aria-label="Arena sections"
      >
        {tabs.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                const next = new URLSearchParams(params)
                next.set('tab', tab.id)
                setParams(next)
              }}
              className={cn(
                'relative px-3 sm:px-4 py-3 text-sm font-medium whitespace-nowrap min-h-[44px] transition-colors shrink-0 scroll-snap-item border-b-2 -mb-px',
                isActive
                  ? 'border-text-primary text-text-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary',
              )}
            >
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.id === 'cup' && slipCount > 0 && (
                <Badge variant="live" className="ml-1.5 align-middle">{slipCount}</Badge>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export function useArenaTab(): ArenaTabId {
  const [params] = useSearchParams()
  const tab = params.get('tab')
  if (tabs.some((t) => t.id === tab)) return tab as ArenaTabId
  return 'cup'
}
