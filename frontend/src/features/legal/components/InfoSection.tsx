import type { ReactNode } from 'react'
import type { ComponentType, SVGProps } from 'react'
import type { InfoPageVariant } from '@/features/legal/constants/infoPageThemes'
import { getInfoTheme } from '@/features/legal/constants/infoPageThemes'
import { cn } from '@/shared/utils/cn'

export function InfoSection({
  variant,
  id,
  index,
  title,
  children,
  icon: Icon,
  hideIndex,
}: {
  variant: InfoPageVariant
  id: string
  index: number
  title: string
  children: ReactNode
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  hideIndex?: boolean
}) {
  const theme = getInfoTheme(variant)
  const style = theme.sectionStyle

  if (style === 'clause') {
    return (
      <section id={id} className="scroll-mt-24 border-l-2 border-accent-primary/50 pl-4 sm:pl-5">
        <h2 className="font-display text-base sm:text-lg font-bold text-text-primary flex items-center gap-2">
          <span className="font-mono text-xs text-accent-primary">{String(index).padStart(2, '0')}.</span>
          {title}
        </h2>
        <div className="mt-3 space-y-3 text-sm text-text-muted leading-relaxed">{children}</div>
      </section>
    )
  }

  if (style === 'card') {
    return (
      <section
        id={id}
        className="scroll-mt-24 rounded-xl border border-accent-win/20 bg-bg-elevated/25 p-4 sm:p-5"
      >
        <div className="flex items-center gap-3 mb-3">
          {Icon && (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-win/10 text-accent-win">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
          )}
          <h2 className="font-display text-lg font-bold text-text-primary">{title}</h2>
        </div>
        <div className="space-y-3 text-sm text-text-muted leading-relaxed">{children}</div>
      </section>
    )
  }

  if (style === 'playbook') {
    return (
      <section id={id} className="scroll-mt-24 rounded-xl border border-border-default/60 bg-bg-surface overflow-hidden">
        <div className="flex items-center gap-3 border-b border-accent-gold/20 bg-accent-gold/5 px-4 py-3 sm:px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-gold/20 font-mono text-sm font-bold text-accent-gold">
            {index}
          </span>
          <h2 className="font-display text-base sm:text-lg font-bold text-text-primary flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-accent-gold shrink-0" aria-hidden="true" />}
            {title}
          </h2>
        </div>
        <div className="p-4 sm:p-5 space-y-3 text-sm text-text-muted leading-relaxed">{children}</div>
      </section>
    )
  }

  if (style === 'editorial') {
    return (
      <section id={id} className="scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          {Icon && (
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-accent-secondary/30 bg-accent-secondary/10 text-accent-secondary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
          )}
          <h2 className="font-display text-xl sm:text-2xl font-bold text-text-primary tracking-tight">{title}</h2>
        </div>
        <div className="space-y-4 text-sm sm:text-base text-text-muted leading-relaxed max-w-3xl">{children}</div>
      </section>
    )
  }

  // support (help)
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className={cn('h-5 w-5 shrink-0', theme.accentClass)} aria-hidden="true" />}
        <h2 className="font-display text-lg font-bold text-text-primary">{title}</h2>
        {!hideIndex && (
          <span className="ml-auto text-[10px] font-mono text-text-muted/60">§{index}</span>
        )}
      </div>
      <div className="space-y-3 text-sm text-text-muted leading-relaxed">{children}</div>
    </section>
  )
}

export function InfoSummaryStrip({
  variant,
  items,
}: {
  variant: InfoPageVariant
  items: { label: string; value: string }[]
}) {
  const theme = getInfoTheme(variant)
  return (
    <div className={cn('flex flex-wrap gap-2 sm:gap-3', variant === 'terms' && 'border-y border-border-default/60 py-4')}>
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            'flex-1 min-w-[140px] rounded-lg px-3 py-2.5',
            variant === 'terms' ? 'bg-bg-elevated/40' : cn('border', theme.accentBorder, theme.accentBg),
          )}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{item.label}</p>
          <p className={cn('mt-0.5 text-sm font-semibold', theme.accentText)}>{item.value}</p>
        </div>
      ))}
    </div>
  )
}
