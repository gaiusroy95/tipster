import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  DocumentTextIcon,
  LifebuoyIcon,
  ScaleIcon,
  ShieldCheckIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import type { InfoPageVariant } from '@/features/legal/constants/infoPageThemes'
import { getInfoTheme } from '@/features/legal/constants/infoPageThemes'
import { ROUTES } from '@/core/constants/routes'
import { cn } from '@/shared/utils/cn'

function MetaRow({ lastUpdated, readingMinutes }: { lastUpdated: string; readingMinutes: number }) {
  return (
    <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
      <div>
        <dt className="sr-only">Last updated</dt>
        <dd>
          Updated{' '}
          <time dateTime={lastUpdated} className="text-text-primary font-medium">
            {new Date(lastUpdated).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </time>
        </dd>
      </div>
      <div>
        <dt className="sr-only">Reading time</dt>
        <dd>{readingMinutes} min read</dd>
      </div>
    </dl>
  )
}

export function InfoPageHero({
  variant,
  title,
  description,
  lastUpdated,
  readingMinutes,
  extra,
}: {
  variant: InfoPageVariant
  title: string
  description: string
  lastUpdated: string
  readingMinutes: number
  extra?: ReactNode
}) {
  const theme = getInfoTheme(variant)

  if (variant === 'terms') {
    return (
      <header className="border-b-2 border-accent-primary/50 pb-6">
        <div className="flex items-center gap-2 text-accent-primary mb-3">
          <ScaleIcon className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">Legal agreement</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">{title}</h1>
        <p className="mt-2 text-sm sm:text-base text-text-muted leading-relaxed max-w-2xl">{description}</p>
        <div className="mt-4">
          <MetaRow lastUpdated={lastUpdated} readingMinutes={readingMinutes} />
        </div>
      </header>
    )
  }

  if (variant === 'privacy') {
    return (
      <header className="relative overflow-hidden rounded-2xl border border-accent-win/25 bg-bg-surface">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent-win/80 via-accent-win to-accent-win/40" aria-hidden="true" />
        <div className="relative flex flex-col sm:flex-row sm:items-start gap-5 p-5 sm:p-7">
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-win/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-win">
              <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Data & privacy
            </span>
            <h1 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-text-primary">{title}</h1>
            <p className="mt-2 text-sm sm:text-base text-text-muted leading-relaxed">{description}</p>
            <div className="mt-4">
              <MetaRow lastUpdated={lastUpdated} readingMinutes={readingMinutes} />
            </div>
          </div>
          <div className="hidden sm:flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-accent-win/20 bg-accent-win/5">
            <ShieldCheckIcon className="h-10 w-10 text-accent-win/70" aria-hidden="true" />
          </div>
        </div>
      </header>
    )
  }

  if (variant === 'rules') {
    return (
      <header className="overflow-hidden rounded-2xl border border-accent-gold/30 bg-gradient-to-br from-bg-elevated via-bg-surface to-bg-elevated">
        <div className="border-b border-accent-gold/20 bg-accent-gold/5 px-5 py-2 sm:px-7">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-accent-gold">Official rulebook</span>
        </div>
        <div className="p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent-gold/15 border border-accent-gold/30">
            <TrophyIcon className="h-7 w-7 text-accent-gold" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">{title}</h1>
            <p className="mt-1.5 text-sm text-text-muted leading-relaxed">{description}</p>
          </div>
          <div className="shrink-0 sm:text-right">
            <MetaRow lastUpdated={lastUpdated} readingMinutes={readingMinutes} />
          </div>
        </div>
      </header>
    )
  }

  if (variant === 'about') {
    return (
      <header className="relative overflow-hidden rounded-2xl px-5 py-8 sm:px-10 sm:py-12">
        <div
          className="absolute inset-0 rounded-2xl border border-border-default/60"
          aria-hidden="true"
          style={{
            background:
              'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(17,16,28,0.95) 45%, rgba(245,158,11,0.08) 100%)',
          }}
        />
        <div className="relative max-w-2xl">
          <p className="text-sm font-medium text-accent-secondary uppercase tracking-widest mb-2">Our story</p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-text-primary leading-tight tracking-tight">
            {title}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-text-muted/95 leading-relaxed">{description}</p>
        </div>
      </header>
    )
  }

  // help
  return (
    <header className="space-y-4">
      <div className="flex items-start gap-4">
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border', theme.accentBorder, theme.accentBg)}>
          <LifebuoyIcon className={cn('h-6 w-6', theme.accentClass)} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">{title}</h1>
          <p className="mt-1 text-sm sm:text-base text-text-muted leading-relaxed">{description}</p>
        </div>
      </div>
      {extra}
      <MetaRow lastUpdated={lastUpdated} readingMinutes={readingMinutes} />
    </header>
  )
}

export function InfoRelatedLinks({
  variant,
  links,
  className,
}: {
  variant: InfoPageVariant
  links: { label: string; to: string; description: string }[]
  className?: string
}) {
  const theme = getInfoTheme(variant)

  if (variant === 'help') {
    return (
      <section className={cn('flex flex-wrap gap-2', className)}>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-full border border-border-default/70 bg-bg-surface px-4 py-2 text-sm font-medium text-text-muted hover:border-accent-live/40 hover:text-accent-live transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </section>
    )
  }

  if (variant === 'about') {
    return (
      <section className={cn('grid gap-3 sm:grid-cols-3', className)}>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="group rounded-2xl border border-border-default/50 bg-bg-elevated/20 p-5 transition-all hover:-translate-y-0.5 hover:border-accent-secondary/40 hover:shadow-card"
          >
            <p className="font-display font-bold text-text-primary group-hover:text-accent-secondary transition-colors">
              {link.label}
            </p>
            <p className="mt-1.5 text-xs text-text-muted leading-relaxed">{link.description}</p>
          </Link>
        ))}
      </section>
    )
  }

  return (
    <section className={cn('rounded-xl border p-4 sm:p-5', theme.accentBorder, 'bg-bg-elevated/20', className)}>
      <h2 className={cn('text-xs font-bold uppercase tracking-wider mb-3', theme.accentText)}>{theme.relatedLabel}</h2>
      <div className="grid gap-2 sm:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-lg border border-border-default/50 bg-bg-surface px-3 py-3 transition-colors hover:border-border-strong"
          >
            <p className="text-sm font-semibold text-text-primary">{link.label}</p>
            <p className="mt-0.5 text-[11px] text-text-muted line-clamp-2">{link.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function InfoBackLink({ className }: { className?: string }) {
  return (
    <Link
      to={ROUTES.HOME}
      className={cn('inline-flex text-sm font-medium text-text-muted hover:text-accent-secondary transition-colors', className)}
    >
      ← Back to arena
    </Link>
  )
}

export function InfoPageIcon({ variant }: { variant: InfoPageVariant }) {
  const icons = {
    terms: DocumentTextIcon,
    privacy: ShieldCheckIcon,
    rules: TrophyIcon,
    about: DocumentTextIcon,
    help: LifebuoyIcon,
  }
  const Icon = icons[variant]
  return <Icon className="h-4 w-4" aria-hidden="true" />
}
