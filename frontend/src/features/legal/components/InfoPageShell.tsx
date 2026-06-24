import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import type { ReactNode } from 'react'
import type { InfoPageVariant } from '@/features/legal/constants/infoPageThemes'
import { getInfoTheme } from '@/features/legal/constants/infoPageThemes'
import { ROUTES } from '@/core/constants/routes'
import { cn } from '@/shared/utils/cn'

export interface InfoTocItem {
  id: string
  label: string
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const pillHover: Record<InfoPageVariant, string> = {
  terms: 'hover:border-accent-primary/50 hover:text-accent-primary hover:bg-accent-primary/5',
  privacy: 'hover:border-accent-win/50 hover:text-accent-win hover:bg-accent-win/5',
  rules: 'hover:border-accent-gold/50 hover:text-accent-gold hover:bg-accent-gold/5',
  about: 'hover:border-accent-secondary/50 hover:text-accent-secondary hover:bg-accent-secondary/5',
  help: 'hover:border-accent-live/50 hover:text-accent-live hover:bg-accent-live/5',
}

export function InfoTocPills({
  variant,
  items,
  className,
}: {
  variant: InfoPageVariant
  items: InfoTocItem[]
  className?: string
}) {
  return (
    <nav
      aria-label="Page sections"
      className={cn('-mx-1 overflow-x-auto pb-1', className)}
    >
      <div className="flex gap-2 px-1 min-w-max sm:min-w-0 sm:flex-wrap">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault()
              scrollTo(item.id)
            }}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              'border-border-default/70 bg-bg-surface text-text-muted',
              pillHover[variant],
            )}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  )
}

export function InfoTocSidebar({
  variant,
  items,
  className,
}: {
  variant: InfoPageVariant
  items: InfoTocItem[]
  className?: string
}) {
  const theme = getInfoTheme(variant)
  return (
    <nav
      aria-label="Table of contents"
      className={cn('rounded-xl border p-4', theme.accentBorder, 'bg-bg-surface/80', className)}
    >
      <p className={cn('mb-3 text-[11px] font-bold uppercase tracking-wider', theme.accentText)}>Contents</p>
      <ol className="space-y-0.5">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault()
                scrollTo(item.id)
              }}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-text-muted hover:bg-bg-elevated hover:text-text-primary transition-colors"
            >
              <span className="font-mono text-[10px] opacity-50">{String(i + 1).padStart(2, '0')}</span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
      <Link
        to={ROUTES.HOME}
        className="mt-4 flex items-center gap-1.5 border-t border-border-default/40 pt-3 text-xs font-medium text-text-muted hover:text-accent-secondary"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Back to arena
      </Link>
    </nav>
  )
}

export function InfoTocSelect({ items }: { items: InfoTocItem[] }) {
  return (
    <div className="rounded-xl border border-border-default/70 bg-bg-surface p-3">
      <label htmlFor="info-toc-select" className="sr-only">
        Jump to section
      </label>
      <select
        id="info-toc-select"
        className="w-full rounded-lg border border-border-default bg-bg-elevated px-3 py-2.5 text-sm text-text-primary"
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) {
            scrollTo(e.target.value)
            e.target.value = ''
          }
        }}
      >
        <option value="" disabled>
          Jump to section…
        </option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function InfoPageShell({
  variant,
  hero,
  intro,
  tocItems,
  children,
  footer,
}: {
  variant: InfoPageVariant
  hero: ReactNode
  intro?: ReactNode
  tocItems: InfoTocItem[]
  children: ReactNode
  footer?: ReactNode
}) {
  const theme = getInfoTheme(variant)
  const { tocMode, layout } = theme

  const contentSpacing = variant === 'help' ? 'space-y-8' : variant === 'about' ? 'space-y-12' : 'space-y-8 sm:space-y-10'

  const mainContent = (
    <div className={cn('min-w-0', contentSpacing)}>
      {tocMode === 'pills' && <InfoTocPills variant={variant} items={tocItems} />}
      {tocMode === 'select' && <InfoTocSelect items={tocItems} />}
      <div
        className={cn(
          contentSpacing,
          layout !== 'support' &&
            variant !== 'terms' &&
            variant !== 'about' &&
            'rounded-2xl border border-border-default/50 bg-bg-surface/40 p-4 sm:p-6 lg:p-8',
          variant === 'terms' && 'pt-2',
        )}
      >
        {children}
      </div>
      {footer}
    </div>
  )

  if (layout === 'narrow') {
    return (
      <div className="pb-10 mx-auto max-w-3xl space-y-6">
        {hero}
        {intro}
        {mainContent}
      </div>
    )
  }

  if (layout === 'sidebar') {
    return (
      <div className="pb-10 mx-auto max-w-6xl space-y-6">
        {hero}
        {intro}
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
          <InfoTocSidebar variant={variant} items={tocItems} className="hidden lg:block lg:sticky lg:top-6 lg:self-start" />
          {mainContent}
        </div>
      </div>
    )
  }

  if (layout === 'support') {
    return (
      <div className="pb-10 mx-auto max-w-3xl space-y-6">
        {hero}
        {intro}
        {mainContent}
      </div>
    )
  }

  // wide (rules, about)
  return (
    <div className="pb-10 mx-auto max-w-4xl space-y-6">
      {hero}
      {intro}
      {mainContent}
    </div>
  )
}
