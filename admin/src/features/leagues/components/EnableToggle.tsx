import { cn } from '@/shared/utils/cn'

export function EnableToggle({
  enabled,
  onChange,
  disabled,
  label,
}: {
  enabled: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
  label?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label ?? (enabled ? 'Disable league' : 'Enable league')}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        'group relative inline-flex h-8 w-[4.5rem] shrink-0 items-center rounded-full border transition-all',
        'disabled:cursor-not-allowed disabled:opacity-50',
        enabled
          ? 'border-accent-win/40 bg-accent-win/15'
          : 'border-border-default bg-bg-elevated/60',
      )}
    >
      <span
        className={cn(
          'absolute inset-y-1 left-1 w-6 rounded-full shadow-sm transition-transform duration-200',
          enabled
            ? 'translate-x-[2rem] bg-accent-win'
            : 'translate-x-0 bg-text-muted/40',
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          'pointer-events-none w-full text-center text-[10px] font-bold uppercase tracking-wide',
          enabled ? 'pr-6 text-accent-win' : 'pl-6 text-text-muted',
        )}
      >
        {enabled ? 'On' : 'Off'}
      </span>
    </button>
  )
}
