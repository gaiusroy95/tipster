import { Link } from 'react-router-dom'
import {
  BanknotesIcon,
  BellAlertIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  LifebuoyIcon,
  LockClosedIcon,
  ScaleIcon,
  ShieldCheckIcon,
  TrophyIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { bettingRules } from '@/core/config/bettingRules'
import { ROUTES } from '@/core/constants/routes'
import { FORUM_VIEW_REWARD, FORUM_VIEW_TARGET } from '@/features/forum/types/forum'
import { LegalCallout } from '@/features/legal/components/LegalCallout'
import { InfoPageShell } from '@/features/legal/components/InfoPageShell'
import { InfoPageHero, InfoRelatedLinks } from '@/features/legal/components/InfoPageHero'
import { InfoSection, InfoSummaryStrip } from '@/features/legal/components/InfoSection'

const LAST_UPDATED = '2026-06-24'

const TOC = [
  { id: 'agreement', label: 'Agreement' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'virtual-credits', label: 'Virtual credits' },
  { id: 'betting', label: 'Betting rules' },
  { id: 'seasons', label: 'Seasons & prizes' },
  { id: 'forum', label: 'Forum & rewards' },
  { id: 'conduct', label: 'Community conduct' },
  { id: 'security', label: 'Account security' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'changes', label: 'Changes' },
  { id: 'contact', label: 'Contact' },
] as const

const formatCredits = (n: number) => n.toLocaleString()

export function TermsPage() {
  return (
    <InfoPageShell
      variant="terms"
      hero={
        <InfoPageHero
          variant="terms"
          title="Terms of Service"
          description="Clear rules for participating in Tipster Arena — a virtual sports prediction competition with no real-money wagering."
          lastUpdated={LAST_UPDATED}
          readingMinutes={6}
        />
      }
      intro={
        <InfoSummaryStrip
          variant="terms"
          items={[
            { label: 'Currency', value: 'Virtual credits only' },
            { label: 'Minimum age', value: '18+ required' },
            { label: 'Competition', value: 'Skill-based rankings' },
            { label: 'Stakes', value: 'Fixed & published limits' },
          ]}
        />
      }
      tocItems={[...TOC]}
      footer={
        <InfoRelatedLinks
          variant="terms"
          links={[
            {
              label: 'Privacy Policy',
              to: ROUTES.PRIVACY,
              description: 'How we collect, use, and protect your account data.',
            },
            {
              label: 'Arena Rules',
              to: ROUTES.RULES,
              description: 'Detailed competition rules for betting and seasons.',
            },
            {
              label: 'Help Center',
              to: ROUTES.HELP,
              description: 'Getting started guides and common questions.',
            },
          ]}
        />
      }
    >
      <LegalCallout variant="accent" title="Important">
        Tipster Arena is <strong className="text-text-primary">not a gambling service</strong>. All activity
        uses virtual credits with no monetary value. Physical prizes, when offered, are distributed offline by
        administrators at season end.
      </LegalCallout>

      <InfoSection variant="terms" id="agreement" index={1} title="Agreement to these terms" icon={ScaleIcon}>
        <p>
          By creating an account, signing in, or using any part of Tipster Arena, you agree to these Terms of
          Service and our{' '}
          <Link to={ROUTES.PRIVACY} className="text-accent-secondary hover:underline font-medium">
            Privacy Policy
          </Link>
          . If you do not agree, do not use the platform.
        </p>
        <p>
          These terms govern your use of the website, virtual wallet, betting features, leaderboard, forum,
          notifications, and seasonal competitions. Supplemental rules may appear in the{' '}
          <Link to={ROUTES.RULES} className="text-accent-secondary hover:underline font-medium">
            Arena Rules
          </Link>{' '}
          — where they conflict, the more specific rule applies for competition mechanics.
        </p>
      </InfoSection>

      <InfoSection variant="terms" id="eligibility" index={2} title="Eligibility" icon={UserGroupIcon}>
        <p>
          You must be at least <strong className="text-text-primary">18 years old</strong> to register and
          participate. You are responsible for ensuring that use of the platform is lawful in your jurisdiction.
        </p>
        <ul className="list-disc pl-5 space-y-2 marker:text-accent-secondary">
          <li>One account per person unless explicitly authorized by administrators.</li>
          <li>Accurate registration information, including a valid email address for verification.</li>
          <li>No automated scripts, bots, or multi-account abuse to manipulate rankings or rewards.</li>
        </ul>
        <LegalCallout variant="warning">
          We may suspend or terminate accounts that violate eligibility requirements or attempt to circumvent
          platform limits.
        </LegalCallout>
      </InfoSection>

      <InfoSection variant="terms" id="virtual-credits" index={3} title="Virtual credits" icon={BanknotesIcon}>
        <p>
          New accounts receive{' '}
          <strong className="text-text-primary">{formatCredits(bettingRules.initialBalance)} virtual credits</strong>{' '}
          as a welcome balance. Credits are a scoring currency for the competition only.
        </p>
        <ul className="list-disc pl-5 space-y-2 marker:text-accent-secondary">
          <li>Credits have <strong className="text-text-primary">no cash value</strong> and cannot be sold, transferred, or redeemed for money.</li>
          <li>There are no deposits, withdrawals, or payment processing for wagering.</li>
          <li>Credit balances, transaction history, and bet outcomes are recorded for leaderboard and profile statistics.</li>
          <li>Administrators may adjust balances in cases of technical errors, abuse, or policy violations.</li>
        </ul>
      </InfoSection>

      <InfoSection variant="terms" id="betting" index={4} title="Betting rules" icon={ClipboardDocumentListIcon}>
        <p>Virtual bets follow fixed, published limits so every participant competes on equal terms:</p>
        <div className="overflow-hidden rounded-xl border border-border-default/70">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-elevated/80 text-xs uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Rule</th>
                <th className="px-4 py-3 font-semibold">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/50">
              <tr>
                <td className="px-4 py-3 font-medium text-text-primary">Allowed stakes</td>
                <td className="px-4 py-3 text-text-muted">
                  {formatCredits(bettingRules.standardStake)} or {formatCredits(bettingRules.premiumStake)} credits per bet
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-text-primary">Daily limit</td>
                <td className="px-4 py-3 text-text-muted">Maximum {bettingRules.dailyBetLimit} bets per calendar day</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-text-primary">Cancellation</td>
                <td className="px-4 py-3 text-text-muted">
                  Active bets may be cancelled with a {bettingRules.cancellationPenaltyPercent}% stake penalty
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-text-primary">Settlement</td>
                <td className="px-4 py-3 text-text-muted">Outcomes determined from official match results via our data providers</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Odds and markets are provided for simulation purposes. We do not guarantee availability of every
          market or fixture. Void or postponed events are handled according to standard settlement policies
          published in the Arena Rules.
        </p>
      </InfoSection>

      <InfoSection variant="terms" id="seasons" index={5} title="Seasons & prizes" icon={TrophyIcon}>
        <p>
          Tipster Arena runs seasonal competitions with leaderboards tracking points, ROI, profit/loss, and
          consistency. Season dates, scoring, and prize tiers are displayed on the Seasons page.
        </p>
        <ul className="list-disc pl-5 space-y-2 marker:text-accent-secondary">
          <li>Rankings are calculated from settled virtual bets during the active season window.</li>
          <li>Physical or offline prizes are awarded by administrators — not through an in-app cash-out flow.</li>
          <li>Prize eligibility, delivery, and tax obligations (if any) are handled outside the platform wallet.</li>
        </ul>
      </InfoSection>

      <InfoSection variant="terms" id="forum" index={6} title="Forum & view rewards" icon={ChatBubbleLeftRightIcon}>
        <p>
          The community forum lets you publish tips, analysis, polls, and media. Forum content must comply with
          our conduct standards below.
        </p>
        <LegalCallout variant="info" title="Forum view milestone">
          Authors may earn{' '}
          <strong className="text-text-primary">{formatCredits(FORUM_VIEW_REWARD)} bonus credits</strong> for
          each {formatCredits(FORUM_VIEW_TARGET)} cumulative views across their published posts. Milestones
          repeat. Bonus credits follow the same virtual-credit rules — no cash value.
        </LegalCallout>
        <p>
          We may remove content, withhold rewards, or restrict posting for spam, harassment, or policy violations.
          View counts exclude self-views by the author.
        </p>
      </InfoSection>

      <InfoSection variant="terms" id="conduct" index={7} title="Community conduct" icon={BellAlertIcon}>
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-2 marker:text-accent-secondary">
          <li>Post unlawful, harassing, hateful, or sexually explicit content.</li>
          <li>Impersonate others or misrepresent affiliation with Tipster Arena.</li>
          <li>Share malware, phishing links, or attempt to compromise other accounts.</li>
          <li>Manipulate rankings through collusion, duplicate accounts, or exploit abuse.</li>
        </ul>
        <p>
          Public profiles, forum posts, and leaderboard entries may be visible to other users according to your
          settings. You retain responsibility for content you publish.
        </p>
      </InfoSection>

      <InfoSection variant="terms" id="security" index={8} title="Account security" icon={LockClosedIcon}>
        <p>
          You are responsible for safeguarding your login credentials. We support email verification, optional
          two-factor authentication, and social sign-in providers where enabled.
        </p>
        <ul className="list-disc pl-5 space-y-2 marker:text-accent-secondary">
          <li>Notify us promptly if you suspect unauthorized access to your account.</li>
          <li>Re-verification may be required when signing in from a new location or device.</li>
          <li>Trusted devices may be remembered for 30 days when 2FA is enabled.</li>
        </ul>
      </InfoSection>

      <InfoSection variant="terms" id="privacy" index={9} title="Privacy & data" icon={ShieldCheckIcon}>
        <p>
          We process account data to operate the competition — including authentication, bet history,
          leaderboard standings, notifications, and settings. We do not sell personal information.
        </p>
        <p>
          Full details are in our{' '}
          <Link to={ROUTES.PRIVACY} className="text-accent-secondary hover:underline font-medium">
            Privacy Policy
          </Link>
          . You may update profile and notification preferences in{' '}
          <Link to={ROUTES.SETTINGS} className="text-accent-secondary hover:underline font-medium">
            Settings
          </Link>
          .
        </p>
      </InfoSection>

      <InfoSection variant="terms" id="changes" index={10} title="Changes to these terms" icon={ClipboardDocumentListIcon}>
        <p>
          We may update these terms to reflect new features, legal requirements, or competition changes. The
          &ldquo;Last updated&rdquo; date at the top of this page will change when we do.
        </p>
        <p>
          Continued use after updates constitutes acceptance. Material changes may also be communicated via
          in-app notification or email where appropriate.
        </p>
      </InfoSection>

      <InfoSection variant="terms" id="contact" index={11} title="Contact & support" icon={LifebuoyIcon}>
        <p>
          For help getting started, account questions, or reporting abuse, visit the{' '}
          <Link to={ROUTES.HELP} className="text-accent-secondary hover:underline font-medium">
            Help Center
          </Link>
          . For competition specifics, see the{' '}
          <Link to={ROUTES.RULES} className="text-accent-secondary hover:underline font-medium">
            Arena Rules
          </Link>
          .
        </p>
        <LegalCallout>
          Tipster Arena is provided &ldquo;as is&rdquo; for entertainment and skill competition. To the fullest
          extent permitted by law, we disclaim warranties and limit liability for indirect or consequential
          damages arising from platform use.
        </LegalCallout>
      </InfoSection>
    </InfoPageShell>
  )
}
