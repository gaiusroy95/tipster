import type { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

type SettingsAccent = 'primary' | 'secondary' | 'gold'

const accentIconWrap: Record<SettingsAccent, string> = {
  primary: 'bg-accent-primary/15 text-accent-primary border-accent-primary/25',
  secondary: 'bg-accent-secondary/15 text-accent-secondary border-accent-secondary/25',
  gold: 'bg-accent-gold/15 text-accent-gold border-accent-gold/25',
}

interface SettingsSectionProps {
  icon: ReactNode
  title: string
  description?: string
  accent?: SettingsAccent
  className?: string
  children: ReactNode
}

export function SettingsSection({
  icon,
  title,
  description,
  accent = 'secondary',
  className,
  children,
}: SettingsSectionProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-border-default bg-bg-surface overflow-hidden',
        className,
      )}
    >
      <div className="flex items-start gap-3 px-4 sm:px-5 py-4 border-b border-border-default/60 bg-bg-elevated/30">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
            accentIconWrap[accent],
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base font-bold tracking-tight text-text-primary">{title}</h2>
          {description && (
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  )
}
