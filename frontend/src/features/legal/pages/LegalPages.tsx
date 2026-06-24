import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/core/constants/routes'

export function ContentPage({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <article>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary mb-2">
        {title}
      </h1>
      {description && (
        <p className="text-text-muted mb-8 leading-relaxed">{description}</p>
      )}
      <div className="space-y-6 text-sm text-text-muted leading-relaxed">{children}</div>
      <Link
        to={ROUTES.HOME}
        className="inline-flex mt-10 text-sm font-medium text-accent-secondary hover:underline underline-offset-4"
      >
        Back to arena
      </Link>
    </article>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-text-primary mb-2">{title}</h2>
      {children}
    </section>
  )
}

export function HelpPage() {
  return (
    <ContentPage
      title="Help Center"
      description="Quick answers for getting started and playing in the arena."
    >
      <Section title="Getting started">
        <p>
          Create an account, claim your welcome credits, browse Tipster Cup fixtures, and
          add a selection to your bet slip. Stakes are fixed at 25K or 100K credits.
        </p>
      </Section>
      <Section title="Rankings & profile">
        <p>
          Your public profile shows season stats, achievements, and open bets. Climb the
          leaderboard by profit and consistency over the season.
        </p>
      </Section>
      <Section title="Need more help?">
        <p>
          Review Arena Rules and Terms of Service for full policy details. For account issues,
          use Settings to update your profile or connected accounts.
        </p>
      </Section>
    </ContentPage>
  )
}
