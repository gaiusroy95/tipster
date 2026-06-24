import type { ReactNode } from 'react'
import {
  BanknotesIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/shared/utils/cn'

export type PageHeroVariant = 'leaderboard' | 'wallet'

interface PageHeroProps {
  variant: PageHeroVariant
  title: string
  description: string
  extra?: ReactNode
  className?: string
}

export function PageHero({ variant, title, description, extra, className }: PageHeroProps) {
  if (variant === 'leaderboard') {
    return (
      <header
        className={cn(
          'relative overflow-hidden rounded-2xl border border-accent-gold/30 bg-bg-surface',
          className,
        )}
      >
        <div
          className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent-gold/90 via-accent-primary/70 to-accent-gold/30"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-16 -top-12 h-44 w-44 rounded-full bg-accent-gold/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-accent-primary/5 blur-2xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4 sm:items-center sm:gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-accent-gold/35 bg-gradient-to-br from-accent-gold/20 to-accent-gold/5 shadow-[0_0_24px_rgba(252,211,77,0.12)]">
              <TrophyIcon className="h-7 w-7 text-accent-gold" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-accent-gold/25 bg-accent-gold/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-gold">
                <SparklesIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Season competition
              </span>
              <h1 className="mt-2.5 font-display text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                {title}
              </h1>
              <p className="mt-1.5 text-sm sm:text-base text-text-muted leading-relaxed max-w-xl">
                {description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:shrink-0 lg:justify-end">
            {extra}
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-border-default/60 bg-bg-elevated/40 px-3 py-2">
              <ChartBarIcon className="h-4 w-4 text-accent-gold shrink-0" aria-hidden="true" />
              <span className="text-xs font-medium text-text-muted">Sort by performance</span>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header
      className={cn(
        'relative overflow-hidden rounded-2xl border border-accent-secondary/25 bg-bg-surface',
        className,
      )}
    >
      <div
        className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent-secondary/80 via-accent-secondary to-accent-primary/50"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-secondary/10 via-transparent to-accent-gold/5"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 -top-16 h-48 w-48 rounded-full bg-accent-secondary/10 blur-3xl"
        aria-hidden="true"
      />

      <div
        className={cn(
          'relative flex flex-col gap-4 p-5 sm:p-7',
          'sm:flex-row sm:items-start sm:gap-5',
          'xl:flex-col xl:items-stretch',
          '2xl:flex-row 2xl:items-center 2xl:justify-between',
        )}
      >
        <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-5">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl border border-accent-secondary/30 bg-gradient-to-br from-accent-secondary/15 to-accent-secondary/5">
            <BanknotesIcon className="h-6 w-6 sm:h-7 sm:w-7 text-accent-secondary" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-accent-secondary/25 bg-accent-secondary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-secondary">
              Arena wallet
            </span>
            <h1 className="mt-2 font-display text-xl sm:text-2xl 2xl:text-3xl font-bold text-text-primary tracking-tight">
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-text-muted leading-relaxed max-w-xl">
              {description}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border-default/70 bg-bg-elevated/50 px-2.5 py-1 text-[11px] font-medium text-text-muted">
                <ShieldCheckIcon className="h-3.5 w-3.5 text-accent-win shrink-0" aria-hidden="true" />
                Virtual credits only
              </span>
              <span className="inline-flex items-center rounded-full border border-border-default/70 bg-bg-elevated/50 px-2.5 py-1 text-[11px] font-medium text-text-muted">
                Full transaction history
              </span>
            </div>
          </div>
        </div>
        {extra}
      </div>
    </header>
  )
}
