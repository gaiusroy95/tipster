import { Link } from 'react-router-dom'
import { ArrowUpRightIcon } from '@heroicons/react/20/solid'
import { AppLogo } from '@/shared/components/AppLogo'
import { ROUTES } from '@/core/constants/routes'
import {
  FOOTER_ACCOUNT_LINKS,
  FOOTER_COMPACT_LINKS,
  FOOTER_COMPETITION_ITEMS,
  FOOTER_LEGAL_LINKS,
  FOOTER_PLATFORM_LINKS,
  type FooterInfoItem,
  type FooterLink,
} from '@/core/constants/footerLinks'
import { cn } from '@/shared/utils/cn'

type SiteFooterProps = {
  variant?: 'full' | 'compact'
  className?: string
}

function FooterNavColumn({
  title,
  links,
  className,
}: {
  title: string
  links: FooterLink[]
  className?: string
}) {
  return (
    <div className={className}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted/90 mb-4">
        {title}
      </p>
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className={cn(
                'group inline-flex items-center gap-1.5 py-1.5 text-sm text-text-muted',
                'transition-colors hover:text-text-primary',
              )}
            >
              <span
                className="h-px w-0 bg-accent-secondary transition-all duration-300 group-hover:w-3"
                aria-hidden="true"
              />
              <span>{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FooterInfoColumn({
  title,
  items,
  moreLink,
  className,
}: {
  title: string
  items: FooterInfoItem[]
  moreLink?: { label: string; to: string }
  className?: string
}) {
  return (
    <div className={className}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted/90 mb-4">
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.label} className="py-1.5 text-sm leading-snug">
            <span className="text-text-muted">{item.label}</span>
            <span className="text-text-primary/90"> · {item.value}</span>
          </li>
        ))}
      </ul>
      {moreLink && (
        <Link
          to={moreLink.to}
          className="mt-3 inline-flex items-center gap-1 text-sm text-accent-secondary hover:underline underline-offset-4 transition-colors"
        >
          {moreLink.label}
          <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}

export function SiteFooter({ variant = 'full', className }: SiteFooterProps) {
  const year = new Date().getFullYear()

  if (variant === 'compact') {
    return (
      <footer
        className={cn(
          'relative border-t border-border-default/50 bg-bg-surface/90',
          className,
        )}
        aria-label="Site footer"
      >
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-secondary/35 to-transparent"
          aria-hidden="true"
        />
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-5">
          <nav
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs"
            aria-label="Legal and help"
          >
            {FOOTER_COMPACT_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-text-muted hover:text-accent-secondary transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-center text-[11px] text-text-muted/80 leading-relaxed">
            © {year} Tipster Arena · Virtual credits only · 18+
          </p>
        </div>
      </footer>
    )
  }

  return (
    <footer
      className={cn(
        'relative mt-auto overflow-hidden',
        'border-t border-border-default/40',
        'bg-gradient-to-b from-bg-surface/40 via-bg-surface to-bg-primary',
        'pb-layout-nav xl:pb-0 safe-area-pb',
        className,
      )}
      aria-label="Site footer"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-secondary/50 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-24 top-0 h-48 w-48 rounded-full bg-accent-secondary/8 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 top-8 h-40 w-40 rounded-full bg-accent-gold/6 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative max-w-[1800px] mx-auto px-4 lg:px-6 py-12 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:gap-8">
          <div className="sm:col-span-2 xl:col-span-2 space-y-5">
            <Link to={ROUTES.HOME} className="inline-flex hover:opacity-90 transition-opacity">
              <AppLogo size="sm" />
            </Link>
            <p className="text-sm text-text-muted leading-relaxed max-w-sm">
              Virtual sports prediction league. Compete on skill, climb leaderboards, and
              unlock achievements — no real-money betting.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center rounded-full border border-accent-gold/35',
                  'bg-gradient-to-r from-accent-gold/12 to-accent-gold/5',
                  'px-3 py-1 text-[11px] font-semibold text-accent-gold',
                )}
              >
                Virtual credits only
              </span>
              <span className="text-[11px] text-text-muted/70">Not a gambling service</span>
            </div>
          </div>

          <FooterNavColumn title="Platform" links={FOOTER_PLATFORM_LINKS} />
          <FooterNavColumn title="Account" links={FOOTER_ACCOUNT_LINKS} />
          <FooterNavColumn title="Legal" links={FOOTER_LEGAL_LINKS} />
          <FooterInfoColumn
            title="Competition"
            items={FOOTER_COMPETITION_ITEMS}
            moreLink={{ label: 'Full arena rules', to: ROUTES.RULES }}
          />
        </div>

        <div className="mt-12 lg:mt-14 pt-6 border-t border-border-default/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-text-muted/80">
              © {year} Tipster Arena. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-muted/80">
              <span>18+ only</span>
              <span className="hidden sm:inline h-3 w-px bg-border-default/80" aria-hidden="true" />
              <span>Offline prizes by administrators</span>
              <Link
                to={ROUTES.HELP}
                className="inline-flex items-center gap-0.5 font-medium text-accent-secondary hover:text-accent-secondary/80 transition-colors"
              >
                Help Center
                <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
