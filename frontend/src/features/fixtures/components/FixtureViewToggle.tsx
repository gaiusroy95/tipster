import { FIXTURE_VIEWS, type FixtureView } from '@/core/constants/sports'
import { useFixtureNavParams } from '@/features/fixtures/hooks/useFixtureNavParams'
import { cn } from '@/shared/utils/cn'

const VIEW_OPTIONS: { id: FixtureView; label: string }[] = [
  { id: FIXTURE_VIEWS.LIVE, label: 'Live' },
  { id: FIXTURE_VIEWS.UPCOMING, label: 'Upcoming' },
]

interface FixtureViewToggleProps {
  className?: string
  /** Refined style for matches page discovery header */
  variant?: 'default' | 'refined'
  fullWidth?: boolean
  /** Compact pills for inline header row on mobile */
  size?: 'default' | 'compact'
}

export function FixtureViewToggle({
  className,
  variant = 'default',
  fullWidth = false,
  size = 'default',
}: FixtureViewToggleProps) {
  const { view, setView } = useFixtureNavParams()
  const isCompact = size === 'compact'

  if (variant === 'refined') {
    return (
      <div
        className={cn(
          'inline-flex shrink-0 rounded-xl border border-border-default/80 bg-bg-elevated/40 p-0.5',
          fullWidth && 'w-full',
          isCompact && 'rounded-lg p-0.5',
          className,
        )}
        role="tablist"
        aria-label="Match view"
      >
        {VIEW_OPTIONS.map((opt) => {
          const active = view === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setView(opt.id)}
              className={cn(
                'rounded-lg font-semibold transition-all duration-200 whitespace-nowrap',
                isCompact
                  ? 'px-2.5 py-1.5 text-xs min-h-[32px]'
                  : 'px-4 py-2.5 text-sm min-h-[44px]',
                fullWidth && !isCompact && 'flex-1 text-center',
                active
                  ? 'bg-accent-secondary text-white shadow-[0_2px_12px_rgba(99,102,241,0.35)]'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50',
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex rounded-lg border border-border-default bg-bg-elevated/60 p-0.5',
        className,
      )}
      role="tablist"
      aria-label="Match view"
    >
      {VIEW_OPTIONS.map((opt) => {
        const active = view === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setView(opt.id)}
            className={cn(
              'rounded-md px-3.5 py-2 text-sm font-semibold min-h-[40px] transition-colors',
              active
                ? 'bg-bg-surface text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
