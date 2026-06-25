import { FixtureViewToggle } from '@/features/fixtures/components/FixtureViewToggle'
import { SportsCategorySlider } from '@/features/fixtures/components/SportsCategorySlider'
import { cn } from '@/shared/utils/cn'

interface MatchesDiscoveryHeaderProps {
  matchCount?: number
  isLoading?: boolean
  className?: string
}

export function MatchesDiscoveryHeader({
  matchCount,
  isLoading,
  className,
}: MatchesDiscoveryHeaderProps) {
  const countLabel =
    isLoading
      ? 'Loading…'
      : typeof matchCount === 'number'
        ? `${matchCount} match${matchCount === 1 ? '' : 'es'}`
        : null

  return (
    <header
      className={cn(
        'sticky z-30 -mx-4 px-4 pt-1 pb-4',
        'top-[var(--layout-header-height)]',
        'border-b border-border-default/50',
        'bg-bg-primary/95 backdrop-blur-md',
        className,
      )}
      aria-label="Match discovery"
    >
      <div
        className={cn(
          'rounded-xl border border-border-default/60',
          'bg-gradient-to-b from-bg-surface/90 to-bg-surface/50',
          'shadow-[0_4px_24px_rgba(0,0,0,0.25)]',
          'p-4 space-y-4',
        )}
      >
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display text-xl font-bold tracking-tight text-text-primary lg:text-2xl shrink-0">
              Matches
            </h1>
            <FixtureViewToggle variant="refined" className="shrink-0" />
          </div>
          {countLabel && (
            <p className="mt-1 text-sm font-medium text-text-muted tabular-nums">{countLabel}</p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted/80">
            Sport
          </p>
          <SportsCategorySlider variant="compact" className="mb-0" />
        </div>
      </div>
    </header>
  )
}
