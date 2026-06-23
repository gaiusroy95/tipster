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

export function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy Policy"
      description="How Tipster Arena handles your account data in this virtual competition platform."
    >
      <Section title="What we collect">
        <p>
          We store account details you provide at registration (email, display name, username)
          and activity related to virtual bets, rankings, and profile settings.
        </p>
      </Section>
      <Section title="How we use data">
        <p>
          Data powers leaderboard standings, season statistics, notifications, and account
          management. We do not sell personal information.
        </p>
      </Section>
      <Section title="Your choices">
        <p>
          You can update profile and notification preferences in Settings. Contact support
          through the Help Center for account-related requests.
        </p>
      </Section>
    </ContentPage>
  )
}

export function RulesPage() {
  return (
    <ContentPage
      title="Arena Rules"
      description="Official competition rules for virtual betting on Tipster Arena."
    >
      <Section title="Virtual credits">
        <p>
          New accounts receive 1,000,000 virtual credits. Credits have no cash value and
          cannot be withdrawn or transferred.
        </p>
      </Section>
      <Section title="Betting limits">
        <p>
          Each bet must be exactly 25,000 or 100,000 credits. You may place up to three bets
          per calendar day. Cancelling an active bet incurs a 10% penalty on the stake.
        </p>
      </Section>
      <Section title="Seasons & prizes">
        <p>
          Seasons run on a fixed schedule. Rankings determine eligibility for offline physical
          prizes awarded by administrators — not through the platform wallet.
        </p>
      </Section>
    </ContentPage>
  )
}

export function AboutPage() {
  return (
    <ContentPage
      title="About Us"
      description="Tipster Arena is built for sports fans who want competitive prediction skill without real-money risk."
    >
      <Section title="Our mission">
        <p>
          We combine fixture markets, leaderboards, achievements, and seasonal rewards into
          one arena where tipsters prove their edge using virtual credits only.
        </p>
      </Section>
      <Section title="What makes us different">
        <p>
          Unlike traditional betting sites, Tipster Arena is a skill competition. There are
          no deposits, no withdrawals, and no real-money wagers — only virtual stakes and
          seasonal prizes.
        </p>
      </Section>
    </ContentPage>
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
