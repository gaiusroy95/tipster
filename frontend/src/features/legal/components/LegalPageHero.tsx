import { Link } from 'react-router-dom'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import { cn } from '@/shared/utils/cn'

export function LegalPageHero({
  eyebrow = 'Legal',
  title,
  description,
  lastUpdated,
  readingMinutes,
}: {
  eyebrow?: string
  title: string
  description: string
  lastUpdated: string
  readingMinutes: number
}) {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-border-default bg-bg-surface shadow-card">
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 75% 55% at 100% 0%, rgba(99,102,241,0.2) 0%, transparent 55%), radial-gradient(ellipse 50% 45% at 0% 100%, rgba(245,158,11,0.1) 0%, transparent 50%)',
        }}
      />
      <div className="relative p-5 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent-secondary/30 bg-accent-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-secondary">
          <DocumentTextIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {eyebrow}
        </div>
        <h1 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight text-text-primary max-w-3xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-base sm:text-lg text-text-muted leading-relaxed">{description}</p>
        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-text-muted">
          <div>
            <dt className="inline font-medium text-text-primary">Last updated: </dt>
            <dd className="inline">
              <time dateTime={lastUpdated}>
                {new Date(lastUpdated).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </dd>
          </div>
          <div>
            <dt className="inline font-medium text-text-primary">Reading time: </dt>
            <dd className="inline">{readingMinutes} min</dd>
          </div>
        </dl>
      </div>
    </header>
  )
}

export function LegalRelatedLinks({
  links,
  className,
}: {
  links: { label: string; to: string; description: string }[]
  className?: string
}) {
  return (
    <section className={cn('rounded-2xl border border-border-default/70 bg-bg-elevated/30 p-5 sm:p-6', className)}>
      <h2 className="font-display text-base font-bold text-text-primary mb-4">Related documents</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="group rounded-xl border border-border-default/60 bg-bg-surface p-4 transition-colors hover:border-accent-secondary/35 hover:shadow-card"
          >
            <p className="font-semibold text-sm text-text-primary group-hover:text-accent-secondary transition-colors">
              {link.label}
            </p>
            <p className="mt-1 text-xs text-text-muted leading-relaxed">{link.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
