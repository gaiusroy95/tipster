import { Link } from 'react-router-dom'
import {
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  KeyIcon,
  RocketLaunchIcon,
  TicketIcon,
  TrophyIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'
import {
  bettingRules,
  calculateCancellationPenalty,
  getStakeLabel,
} from '@/core/config/bettingRules'
import { ROUTES, loginPath } from '@/core/constants/routes'
import { FORUM_VIEW_REWARD, FORUM_VIEW_TARGET } from '@/features/forum/types/forum'
import { HelpFaqItem, HelpFaqList } from '@/features/legal/components/HelpFaq'
import { LegalCallout } from '@/features/legal/components/LegalCallout'
import { InfoPageShell } from '@/features/legal/components/InfoPageShell'
import { InfoPageHero, InfoRelatedLinks } from '@/features/legal/components/InfoPageHero'
import { InfoSection } from '@/features/legal/components/InfoSection'
import { cn } from '@/shared/utils/cn'

const LAST_UPDATED = '2026-06-24'

const TOC = [
  { id: 'quick-start', label: 'Quick start' },
  { id: 'betting', label: 'Betting' },
  { id: 'wallet', label: 'Wallet & credits' },
  { id: 'rankings', label: 'Rankings & profile' },
  { id: 'forum', label: 'Forum' },
  { id: 'account', label: 'Account & security' },
  { id: 'troubleshooting', label: 'Troubleshooting' },
  { id: 'more-help', label: 'More help' },
] as const

const fmt = (n: number) => n.toLocaleString()

function QuickLinkCard({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: typeof RocketLaunchIcon
  title: string
  description: string
  href: string
}) {
  return (
    <a
      href={href}
      className="group rounded-xl border border-border-default/70 bg-bg-surface p-4 transition-all hover:border-accent-live/40 hover:shadow-card"
    >
      <div className="mb-3 inline-flex rounded-lg border border-accent-live/25 bg-accent-live/10 p-2 text-accent-live">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="font-display text-sm font-bold text-text-primary group-hover:text-accent-live transition-colors">
        {title}
      </p>
      <p className="mt-1 text-xs text-text-muted leading-relaxed">{description}</p>
    </a>
  )
}

function StepGuide({ steps }: { steps: { title: string; body: string; link?: { to: string; label: string } }[] }) {
  return (
    <ol className="space-y-4 not-prose">
      {steps.map((step, i) => (
        <li key={step.title} className="flex gap-4">
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-bold',
              'border-accent-live/30 bg-accent-live/10 text-accent-live',
            )}
            aria-hidden="true"
          >
            {i + 1}
          </span>
          <div>
            <p className="font-semibold text-text-primary">{step.title}</p>
            <p className="mt-1 text-sm text-text-muted leading-relaxed">{step.body}</p>
            {step.link && (
              <Link
                to={step.link.to}
                className="mt-2 inline-flex text-sm font-medium text-accent-secondary hover:underline"
              >
                {step.link.label} →
              </Link>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

export function HelpPage() {
  const penalty25k = calculateCancellationPenalty(bettingRules.standardStake)

  return (
    <InfoPageShell
      variant="help"
      hero={
        <InfoPageHero
          variant="help"
          title="Help Center"
          description="Guides, FAQs, and quick answers for getting the most out of Tipster Arena — from your first bet to the top of the leaderboard."
          lastUpdated={LAST_UPDATED}
          readingMinutes={6}
          extra={
            <div className="grid gap-3 sm:grid-cols-2 not-prose">
              <QuickLinkCard
                icon={RocketLaunchIcon}
                title="Quick start"
                description="New here? Start with account setup and your first bet."
                href="#quick-start"
              />
              <QuickLinkCard
                icon={TicketIcon}
                title="Betting"
                description="Stakes, limits, cancellation, and settlement."
                href="#betting"
              />
              <QuickLinkCard
                icon={UserCircleIcon}
                title="Account"
                description="Profile, 2FA, social login, and settings."
                href="#account"
              />
              <QuickLinkCard
                icon={WrenchScrewdriverIcon}
                title="Troubleshooting"
                description="Common issues and how to fix them."
                href="#troubleshooting"
              />
            </div>
          }
        />
      }
      tocItems={[...TOC]}
      footer={
        <InfoRelatedLinks
          variant="help"
          links={[
            {
              label: 'Arena Rules',
              to: ROUTES.RULES,
              description: 'Official betting limits and competition rules.',
            },
            {
              label: 'About Us',
              to: ROUTES.ABOUT,
              description: 'What Tipster Arena is and how the platform works.',
            },
            {
              label: 'Terms of Service',
              to: ROUTES.TERMS,
              description: 'Full platform agreement and policies.',
            },
          ]}
        />
      }
    >
      <LegalCallout variant="info">
        Tipster Arena uses <strong className="text-text-primary">virtual credits only</strong>. If your question
        involves deposits, withdrawals, or real-money gambling — that is outside what this platform offers.
      </LegalCallout>

      <InfoSection variant="help" id="quick-start" index={1} title="Quick start" icon={RocketLaunchIcon}>
        <p>New to the arena? Follow these steps to place your first virtual bet:</p>
        <StepGuide
          steps={[
            {
              title: 'Create an account',
              body: 'Register with email or sign in with Google/Facebook. Verify your email when prompted.',
              link: { to: ROUTES.REGISTER, label: 'Create account' },
            },
            {
              title: 'Receive welcome credits',
              body: `Your wallet starts with ${fmt(bettingRules.initialBalance)} virtual credits automatically after registration.`,
              link: { to: ROUTES.WALLET, label: 'Open wallet' },
            },
            {
              title: 'Browse Tipster Cup',
              body: 'From the home page, open the Cup tab, pick a sport, and select a fixture to view markets and odds.',
              link: { to: `${ROUTES.HOME}?tab=cup`, label: 'Browse matches' },
            },
            {
              title: 'Add to bet slip & confirm',
              body: `Tap a selection, choose ${getStakeLabel(bettingRules.standardStake)} or ${getStakeLabel(bettingRules.premiumStake)} credits, and confirm. Max ${bettingRules.dailyBetLimit} bets per day.`,
              link: { to: ROUTES.BET_SLIP, label: 'Bet slip' },
            },
            {
              title: 'Track on profile & leaderboard',
              body: 'Active and settled bets appear on your profile. Climb rankings as results come in.',
              link: { to: ROUTES.LEADERBOARD, label: 'View leaderboard' },
            },
          ]}
        />
      </InfoSection>

      <InfoSection variant="help" id="betting" index={2} title="Betting FAQ" icon={TicketIcon}>
        <HelpFaqList>
          <HelpFaqItem question={`What stake sizes can I use?`}>
            Only <strong className="text-text-primary">{fmt(bettingRules.standardStake)}</strong> (
            {getStakeLabel(bettingRules.standardStake)}) or{' '}
            <strong className="text-text-primary">{fmt(bettingRules.premiumStake)}</strong> (
            {getStakeLabel(bettingRules.premiumStake)}) credits per bet. Custom amounts are not supported.
          </HelpFaqItem>
          <HelpFaqItem question="How many bets can I place per day?">
            Up to <strong className="text-text-primary">{bettingRules.dailyBetLimit} bets</strong> per calendar
            day. The counter resets at midnight in your local timezone.
          </HelpFaqItem>
          <HelpFaqItem question="Can I cancel a bet after placing it?">
            Yes, before the event starts. A{' '}
            <strong className="text-text-primary">{bettingRules.cancellationPenaltyPercent}% penalty</strong> applies
            to the stake (e.g. {fmt(penalty25k)} credits on a {getStakeLabel(bettingRules.standardStake)} bet). After
            kickoff, cancellation is not available.
          </HelpFaqItem>
          <HelpFaqItem question="When are bets settled?">
            Automatically after official results are confirmed. Won bets credit your total payout (stake + win); lost bets
            keep the stake deducted at placement. Check Active Bets and Bet History for status.
          </HelpFaqItem>
          <HelpFaqItem question="Why was my bet rejected?">
            Common reasons: insufficient balance, daily limit reached, invalid stake size, fixture already started,
            or market suspended. Ensure you meet all{' '}
            <Link to={ROUTES.RULES} className="text-accent-secondary hover:underline font-medium">
              Arena Rules
            </Link>{' '}
            before retrying.
          </HelpFaqItem>
        </HelpFaqList>
      </InfoSection>

      <InfoSection variant="help" id="wallet" index={3} title="Wallet & credits" icon={BanknotesIcon}>
        <HelpFaqList>
          <HelpFaqItem question="Can I buy or withdraw credits?">
            No. Credits are virtual with no cash value. There are no deposits, purchases, or withdrawals.
          </HelpFaqItem>
          <HelpFaqItem question="Where can I see my transaction history?">
            Open the <Link to={ROUTES.WALLET} className="text-accent-secondary hover:underline font-medium">Wallet</Link>{' '}
            page for your balance and a full log of bet placements, wins, losses, penalties, and forum bonuses.
          </HelpFaqItem>
          <HelpFaqItem question="What is a forum bonus credit?">
            When your published forum posts reach view milestones ({fmt(FORUM_VIEW_TARGET)} views), you earn{' '}
            {fmt(FORUM_VIEW_REWARD)} bonus credits. These appear as <code className="text-xs bg-bg-elevated px-1 rounded">forum_bonus</code>{' '}
            transactions in your wallet.
          </HelpFaqItem>
          <HelpFaqItem question="My balance looks wrong — what should I do?">
            Check Wallet transactions for the exact debit/credit. If a settled bet seems incorrect, note the bet ID
            from Bet History and see Troubleshooting below.
          </HelpFaqItem>
        </HelpFaqList>
      </InfoSection>

      <InfoSection variant="help" id="rankings" index={4} title="Rankings & profile" icon={TrophyIcon}>
        <HelpFaqList>
          <HelpFaqItem question="How does the leaderboard work?">
            Rankings use season statistics — points, ROI, profit/loss, and win rate. Only{' '}
            <strong className="text-text-primary">settled</strong> bets count toward standings.
          </HelpFaqItem>
          <HelpFaqItem question="What appears on my public profile?">
            Display name, avatar, season stats, achievements, form streak, and betting history (based on your
            privacy settings). Other users can view your profile from the leaderboard or forum.
          </HelpFaqItem>
          <HelpFaqItem question="How do achievements unlock?">
            Achievements track milestones like bet volume, win streaks, and performance targets. View progress
            on the Achievements tab on the home page or your profile.
          </HelpFaqItem>
          <HelpFaqItem question="How do seasons and prizes work?">
            Seasons have fixed dates and prize tiers for top ranks. Physical prizes are awarded offline by
            administrators — not through the in-app wallet. See the{' '}
            <Link to={ROUTES.SEASONS} className="text-accent-secondary hover:underline font-medium">Seasons</Link>{' '}
            page for the current schedule.
          </HelpFaqItem>
        </HelpFaqList>
      </InfoSection>

      <InfoSection variant="help" id="forum" index={5} title="Forum" icon={ChatBubbleLeftRightIcon}>
        <HelpFaqList>
          <HelpFaqItem question="How do I create a post?">
            Go to <Link to={ROUTES.FORUM} className="text-accent-secondary hover:underline font-medium">Forum</Link>,
            click Write a post, and add a title, body, optional category, tags, media, or poll. You can publish
            immediately, save a draft, or schedule for later.
          </HelpFaqItem>
          <HelpFaqItem question="How do view rewards work?">
            Each {fmt(FORUM_VIEW_TARGET)} cumulative views on your published posts triggers a{' '}
            {fmt(FORUM_VIEW_REWARD)} credit bonus. Your own views do not count. Track progress on your dashboard
            rewards widget.
          </HelpFaqItem>
          <HelpFaqItem question="Can I edit or delete my posts?">
            Use the post detail page or your Drafts tab to manage content you authored. Community guidelines apply
            — see{' '}
            <Link to={ROUTES.TERMS} className="text-accent-secondary hover:underline font-medium">Terms of Service</Link>.
          </HelpFaqItem>
        </HelpFaqList>
      </InfoSection>

      <InfoSection variant="help" id="account" index={6} title="Account & security" icon={KeyIcon}>
        <HelpFaqList>
          <HelpFaqItem question="How do I change my password or profile?">
            Open <Link to={ROUTES.SETTINGS} className="text-accent-secondary hover:underline font-medium">Settings</Link>{' '}
            for password, notifications, and connected accounts. Edit display name, avatar, and signature from{' '}
            <Link to={ROUTES.PROFILE_EDIT} className="text-accent-secondary hover:underline font-medium">Profile edit</Link>.
          </HelpFaqItem>
          <HelpFaqItem question="How do I enable two-factor authentication (2FA)?">
            In Settings → Security, choose authenticator app or phone verification. At login, enter the code after
            your password. You can trust a device for 30 days.
          </HelpFaqItem>
          <HelpFaqItem question="Why was I asked to verify my email again?">
            We may require re-verification when signing in from a new IP or location. Check your inbox for a
            fresh verification link.
          </HelpFaqItem>
          <HelpFaqItem question="How do I connect Google or Facebook?">
            Use Settings → Connected accounts to link or unlink social providers. Your custom avatar is preserved
            when re-linking the same provider.
          </HelpFaqItem>
          <HelpFaqItem question="I forgot my password">
            Use{' '}
            <Link to={ROUTES.FORGOT_PASSWORD} className="text-accent-secondary hover:underline font-medium">
              Forgot password
            </Link>{' '}
            to receive a reset link by email. Links expire after a limited time.
          </HelpFaqItem>
        </HelpFaqList>
      </InfoSection>

      <InfoSection variant="help" id="troubleshooting" index={7} title="Troubleshooting" icon={WrenchScrewdriverIcon}>
        <HelpFaqList>
          <HelpFaqItem question="Fixtures or odds are not loading">
            Refresh the page and check your connection. Sports data comes from external providers — brief outages
            can occur. Try a different sport or league, or wait a few minutes.
          </HelpFaqItem>
          <HelpFaqItem question="I am logged out unexpectedly">
            Sessions expire after a period of inactivity or if tokens are cleared. Sign in again at{' '}
            <Link to={loginPath()} className="text-accent-secondary hover:underline font-medium">Login</Link>.
            Enable 2FA for added security.
          </HelpFaqItem>
          <HelpFaqItem question="Notifications are not appearing">
            Check Settings → Notifications for email/push toggles. In-app notifications appear on the{' '}
            <Link to={ROUTES.NOTIFICATIONS} className="text-accent-secondary hover:underline font-medium">
              Notifications
            </Link>{' '}
            page.
          </HelpFaqItem>
          <HelpFaqItem question="Bet settlement seems incorrect">
            Settlement uses official match results from our data feed. Allow time after full-time for processing.
            If the issue persists, note your bet ID from Bet History for support review.
          </HelpFaqItem>
          <HelpFaqItem question="Page shows an error or blank screen">
            Hard-refresh the browser (Ctrl+Shift+R / Cmd+Shift+R). Clear site cache if problems continue. Ensure
            you are using a modern browser (Chrome, Firefox, Safari, Edge).
          </HelpFaqItem>
        </HelpFaqList>
      </InfoSection>

      <InfoSection variant="help" id="more-help" index={8} title="Still need help?" icon={Cog6ToothIcon}>
        <p>
          Most answers live in this Help Center and our policy pages. For deeper detail, review:
        </p>
        <ul className="list-disc pl-5 space-y-2 marker:text-accent-secondary">
          <li>
            <Link to={ROUTES.RULES} className="text-accent-secondary hover:underline font-medium">Arena Rules</Link>{' '}
            — betting limits, settlement, and fair play
          </li>
          <li>
            <Link to={ROUTES.TERMS} className="text-accent-secondary hover:underline font-medium">Terms of Service</Link>{' '}
            — participation agreement
          </li>
          <li>
            <Link to={ROUTES.PRIVACY} className="text-accent-secondary hover:underline font-medium">Privacy Policy</Link>{' '}
            — how we handle your data
          </li>
          <li>
            <Link to={ROUTES.ABOUT} className="text-accent-secondary hover:underline font-medium">About Us</Link>{' '}
            — platform overview and mission
          </li>
        </ul>
        <LegalCallout variant="accent">
          Account-specific issues (wrong settlement, suspected abuse, deletion requests) — gather your username,
          bet ID if relevant, and a short description before reaching out through your project support channel.
        </LegalCallout>
      </InfoSection>
    </InfoPageShell>
  )
}
