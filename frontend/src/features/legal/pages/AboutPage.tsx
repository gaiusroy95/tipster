import { Link } from 'react-router-dom'
import {
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  HeartIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrophyIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { bettingRules, getStakeLabel } from '@/core/config/bettingRules'
import { ROUTES } from '@/core/constants/routes'
import { LOGO_ALT } from '@/core/constants/branding'
import { LegalCallout } from '@/features/legal/components/LegalCallout'
import { LegalDocumentLayout } from '@/features/legal/components/LegalDocumentLayout'
import { LegalPageHero, LegalRelatedLinks } from '@/features/legal/components/LegalPageHero'
import { LegalSection } from '@/features/legal/components/LegalSection'
import { LegalSummaryGrid } from '@/features/legal/components/LegalSummaryGrid'
import { cn } from '@/shared/utils/cn'

const LAST_UPDATED = '2026-06-24'

const TOC = [
  { id: 'story', label: 'Our story' },
  { id: 'mission', label: 'Mission' },
  { id: 'platform', label: 'The platform' },
  { id: 'different', label: 'What sets us apart' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'community', label: 'Community' },
  { id: 'values', label: 'Our values' },
  { id: 'start', label: 'Get started' },
] as const

const PLATFORM_FEATURES = [
  {
    icon: ChartBarIcon,
    title: 'Tipster Cup',
    description: 'Browse live and upcoming fixtures with real odds — place virtual bets on markets you know.',
  },
  {
    icon: TrophyIcon,
    title: 'Leaderboard',
    description: 'Track ROI, profit/loss, and form against other tipsters in real time.',
  },
  {
    icon: SparklesIcon,
    title: 'Achievements',
    description: 'Unlock badges and milestones as you hit streaks, volume, and performance targets.',
  },
  {
    icon: RocketLaunchIcon,
    title: 'Seasons',
    description: 'Compete in timed seasons with prize tiers for top-ranked performers.',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Forum',
    description: 'Share picks, strategy, and analysis — earn bonus credits as your posts gain views.',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Virtual wallet',
    description: 'Transparent credit balance and full transaction history for every bet.',
  },
] as const

function PlatformFeatureGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 not-prose">
      {PLATFORM_FEATURES.map(({ icon: Icon, title, description }) => (
        <div
          key={title}
          className="rounded-xl border border-border-default/70 bg-bg-elevated/30 p-4 transition-colors hover:border-accent-secondary/30"
        >
          <div className="mb-3 inline-flex rounded-lg border border-accent-secondary/25 bg-accent-secondary/10 p-2 text-accent-secondary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 className="font-display text-sm font-bold text-text-primary">{title}</h3>
          <p className="mt-1.5 text-sm text-text-muted leading-relaxed">{description}</p>
        </div>
      ))}
    </div>
  )
}

function StepList({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className="space-y-4 not-prose">
      {steps.map((step, i) => (
        <li key={step.title} className="flex gap-4">
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-bold',
              'border-accent-secondary/30 bg-accent-secondary/10 text-accent-secondary',
            )}
            aria-hidden="true"
          >
            {i + 1}
          </span>
          <div>
            <p className="font-semibold text-text-primary">{step.title}</p>
            <p className="mt-1 text-sm text-text-muted leading-relaxed">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function AboutPage() {
  return (
    <LegalDocumentLayout
      hero={
        <LegalPageHero
          eyebrow="About"
          title={`About ${LOGO_ALT}`}
          description="We built a virtual tipster league for sports fans who want the thrill of prediction and competition — without real-money risk."
          lastUpdated={LAST_UPDATED}
          readingMinutes={4}
        />
      }
      summary={
        <LegalSummaryGrid
          items={[
            {
              icon: LightBulbIcon,
              title: 'Skill over luck',
              description: 'Rankings reward consistent analysis and disciplined staking over time.',
              accent: 'secondary',
            },
            {
              icon: ShieldCheckIcon,
              title: 'No real-money betting',
              description: 'Virtual credits only — no deposits, withdrawals, or cash wagers.',
              accent: 'win',
            },
            {
              icon: UserGroupIcon,
              title: 'Built for tipsters',
              description: 'Profiles, forums, and leaderboards designed for a competitive community.',
              accent: 'gold',
            },
            {
              icon: HeartIcon,
              title: 'Sports-first',
              description: 'Fixtures, odds, and markets from real sports — simulated stakes, real bragging rights.',
              accent: 'live',
            },
          ]}
        />
      }
      tocItems={[...TOC]}
      relatedLinks={
        <LegalRelatedLinks
          links={[
            {
              label: 'Arena Rules',
              to: ROUTES.RULES,
              description: 'Official competition rules and betting limits.',
            },
            {
              label: 'Help Center',
              to: ROUTES.HELP,
              description: 'Guides for new players and common questions.',
            },
            {
              label: 'Terms of Service',
              to: ROUTES.TERMS,
              description: 'Full platform agreement and participation terms.',
            },
          ]}
        />
      }
    >
      <LegalCallout variant="info">
        {LOGO_ALT} is a <strong className="text-text-primary">virtual sports prediction competition</strong>.
        We are not a licensed bookmaker and do not accept real-money bets.
      </LegalCallout>

      <LegalSection id="story" index={1} title="Our story" icon={RocketLaunchIcon}>
        <p>
          Sports prediction is one of the oldest fan debates — who wins, by how much, and why. {LOGO_ALT}{' '}
          turns that instinct into a structured competition: real fixtures and odds, virtual stakes, and
          public rankings that show who reads the game best.
        </p>
        <p>
          We created the arena because traditional betting sites optimize for wagering revenue. We optimize
          for <strong className="text-text-primary">skill visibility</strong> — giving tipsters a fair stage
          to prove their edge season after season.
        </p>
      </LegalSection>

      <LegalSection id="mission" index={2} title="Our mission" icon={LightBulbIcon}>
        <p>
          Our mission is to make competitive sports prediction accessible, transparent, and fun — without
          financial risk. Every player starts with the same virtual bankroll and the same published rules.
        </p>
        <ul className="list-disc pl-5 space-y-2 marker:text-accent-secondary">
          <li>Democratize tipster competition with equal starting credits and fixed stake sizes.</li>
          <li>Surface performance through leaderboards, profiles, and season statistics.</li>
          <li>Foster community through forums, achievements, and shared analysis.</li>
          <li>Reward top performers with seasonal recognition and offline prizes — not cash payouts in-app.</li>
        </ul>
      </LegalSection>

      <LegalSection id="platform" index={3} title="The platform" icon={ChartBarIcon}>
        <p>
          {LOGO_ALT} brings together everything a tipster needs in one place. Here is what you will find
          inside the arena:
        </p>
        <PlatformFeatureGrid />
      </LegalSection>

      <LegalSection id="different" index={4} title="What sets us apart" icon={SparklesIcon}>
        <div className="overflow-hidden rounded-xl border border-border-default/70">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-elevated/80 text-xs uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Traditional betting sites</th>
                <th className="px-4 py-3 font-semibold">{LOGO_ALT}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/50">
              <tr>
                <td className="px-4 py-3 text-text-muted">Real-money deposits & withdrawals</td>
                <td className="px-4 py-3 text-text-primary font-medium">Virtual credits only</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-text-muted">Variable stake sizes</td>
                <td className="px-4 py-3 text-text-primary font-medium">
                  Fixed {getStakeLabel(bettingRules.standardStake)} / {getStakeLabel(bettingRules.premiumStake)} stakes
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-text-muted">House profit from losses</td>
                <td className="px-4 py-3 text-text-primary font-medium">Skill rankings & seasonal prizes</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-text-muted">Private betting history</td>
                <td className="px-4 py-3 text-text-primary font-medium">Public profiles & leaderboards</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-text-muted">Limited community features</td>
                <td className="px-4 py-3 text-text-primary font-medium">Forum, achievements & notifications</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection id="how-it-works" index={5} title="How it works" icon={TrophyIcon}>
        <p>New to the arena? Here is the path from signup to the leaderboard:</p>
        <StepList
          steps={[
            {
              title: 'Create your account',
              body: 'Register with email or social sign-in. Verify your email and receive your welcome virtual credits.',
            },
            {
              title: 'Explore Tipster Cup fixtures',
              body: 'Browse sports, leagues, and matches. Open a fixture to see markets and live odds.',
            },
            {
              title: 'Build your bet slip',
              body: `Choose a selection and stake ${getStakeLabel(bettingRules.standardStake)} or ${getStakeLabel(bettingRules.premiumStake)} credits — up to ${bettingRules.dailyBetLimit} bets per day.`,
            },
            {
              title: 'Track results & climb ranks',
              body: 'Settled bets update your wallet and season stats. Compare performance on the leaderboard and your public profile.',
            },
            {
              title: 'Join the community',
              body: 'Post analysis in the forum, unlock achievements, and compete for seasonal prize tiers.',
            },
          ]}
        />
      </LegalSection>

      <LegalSection id="community" index={6} title="Community" icon={UserGroupIcon}>
        <p>
          Tipsters are not just bettors — they are analysts, fans, and competitors. The forum lets you publish
          picks and strategy with categories, tags, polls, and media. Top posts can earn view-milestone bonus
          credits that feed back into your virtual wallet.
        </p>
        <p>
          Public profiles showcase your season form, achievements, medal tier, and betting history (where
          visibility settings allow). Follow the leaderboard to find rising talent or study how the best
          tipsters approach each sport.
        </p>
        <LegalCallout variant="accent">
          We believe open competition makes everyone sharper. That is why rankings, rules, and stake limits
          are published — not hidden behind a paywall.
        </LegalCallout>
      </LegalSection>

      <LegalSection id="values" index={7} title="Our values" icon={HeartIcon}>
        <ul className="list-disc pl-5 space-y-2 marker:text-accent-secondary">
          <li>
            <strong className="text-text-primary">Fairness</strong> — equal starting credits, fixed stakes,
            and enforced daily limits for everyone.
          </li>
          <li>
            <strong className="text-text-primary">Transparency</strong> — published rules, visible wallet
            history, and clear settlement outcomes.
          </li>
          <li>
            <strong className="text-text-primary">Responsibility</strong> — virtual-only competition for
            adults 18+. No real-money gambling mechanics.
          </li>
          <li>
            <strong className="text-text-primary">Respect</strong> — zero tolerance for harassment, abuse,
            or manipulation in forum and profile spaces.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="start" index={8} title="Get started" icon={RocketLaunchIcon}>
        <p>
          Ready to enter the arena? Head to the{' '}
          <Link to={ROUTES.HOME} className="text-accent-secondary hover:underline font-medium">
            home page
          </Link>{' '}
          to browse fixtures, or read the{' '}
          <Link to={ROUTES.HELP} className="text-accent-secondary hover:underline font-medium">
            Help Center
          </Link>{' '}
          for a guided walkthrough.
        </p>
        <p>
          For competition specifics, see{' '}
          <Link to={ROUTES.RULES} className="text-accent-secondary hover:underline font-medium">
            Arena Rules
          </Link>{' '}
          and our{' '}
          <Link to={ROUTES.TERMS} className="text-accent-secondary hover:underline font-medium">
            Terms of Service
          </Link>
          .
        </p>
      </LegalSection>
    </LegalDocumentLayout>
  )
}
