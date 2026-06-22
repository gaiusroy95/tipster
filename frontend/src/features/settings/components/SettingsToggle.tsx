import { cn } from '@/shared/utils/cn'

interface SettingsToggleProps {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}

export function SettingsToggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: SettingsToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex items-start justify-between gap-4 w-full rounded-xl border border-border-default/70',
        'bg-bg-elevated/40 px-4 py-3.5 min-h-[52px] text-left transition-colors',
        'hover:bg-bg-elevated/60 hover:border-border-default',
        disabled && 'opacity-60 cursor-not-allowed',
      )}
    >
      <div className="min-w-0 flex-1 pr-2">
        <p className="font-medium text-text-primary">{label}</p>
        {description && (
          <p className="text-sm text-text-muted mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <div
        className={cn(
          'w-11 h-6 rounded-full transition-colors relative shrink-0 mt-0.5',
          checked ? 'bg-accent-primary' : 'bg-bg-elevated border border-border-default',
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </div>
    </button>
  )
}
