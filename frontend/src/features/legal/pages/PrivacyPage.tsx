import { Link } from 'react-router-dom'
import {
  BellIcon,
  CircleStackIcon,
  ClockIcon,
  Cog6ToothIcon,
  DevicePhoneMobileIcon,
  EyeIcon,
  FingerPrintIcon,
  GlobeAltIcon,
  LockClosedIcon,
  NoSymbolIcon,
  ServerStackIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { ROUTES } from '@/core/constants/routes'
import { LegalCallout } from '@/features/legal/components/LegalCallout'
import { LegalDocumentLayout } from '@/features/legal/components/LegalDocumentLayout'
import { LegalPageHero, LegalRelatedLinks } from '@/features/legal/components/LegalPageHero'
import { LegalSection } from '@/features/legal/components/LegalSection'
import { LegalSummaryGrid } from '@/features/legal/components/LegalSummaryGrid'

const LAST_UPDATED = '2026-06-24'

const TOC = [
  { id: 'overview', label: 'Overview' },
  { id: 'collect', label: 'Data we collect' },
  { id: 'use', label: 'How we use data' },
  { id: 'sharing', label: 'Sharing & processors' },
  { id: 'cookies', label: 'Cookies & sessions' },
  { id: 'security', label: 'Security' },
  { id: 'retention', label: 'Retention' },
  { id: 'choices', label: 'Your choices' },
  { id: 'children', label: 'Age requirement' },
  { id: 'transfers', label: 'International hosting' },
  { id: 'changes', label: 'Policy changes' },
  { id: 'contact', label: 'Contact' },
] as const

export function PrivacyPage() {
  return (
    <LegalDocumentLayout
      hero={
        <LegalPageHero
          eyebrow="Privacy"
          title="Privacy Policy"
          description="How Tipster Arena collects, uses, and protects information when you compete with virtual credits — written in plain language, not legalese."
          lastUpdated={LAST_UPDATED}
          readingMinutes={7}
        />
      }
      summary={
        <LegalSummaryGrid
          items={[
            {
              icon: NoSymbolIcon,
              title: 'We do not sell data',
              description: 'Personal information is used to run the platform — never sold to advertisers or data brokers.',
              accent: 'live',
            },
            {
              icon: Cog6ToothIcon,
              title: 'You stay in control',
              description: 'Update profile, notifications, and privacy settings anytime from your account.',
              accent: 'secondary',
            },
            {
              icon: FingerPrintIcon,
              title: 'Security-first auth',
              description: 'Passwords are hashed, sessions are signed, and optional 2FA is supported.',
              accent: 'win',
            },
            {
              icon: CircleStackIcon,
              title: 'Purpose-limited',
              description: 'We collect only what we need for accounts, competition stats, and community features.',
              accent: 'gold',
            },
          ]}
        />
      }
      tocItems={[...TOC]}
      relatedLinks={
        <LegalRelatedLinks
          links={[
            {
              label: 'Terms of Service',
              to: ROUTES.TERMS,
              description: 'Rules for using Tipster Arena and virtual credits.',
            },
            {
              label: 'Arena Rules',
              to: ROUTES.RULES,
              description: 'Competition mechanics, stakes, and season prizes.',
            },
            {
              label: 'Help Center',
              to: ROUTES.HELP,
              description: 'Account help and common questions.',
            },
          ]}
        />
      }
    >
      <LegalCallout variant="info" title="Plain-language summary">
        Tipster Arena is a <strong className="text-text-primary">virtual competition platform</strong>. We process
        account and activity data so you can bet with credits, appear on leaderboards, receive notifications, and
        participate in the forum. We do not process real-money payments or gambling transactions.
      </LegalCallout>

      <LegalSection id="overview" index={1} title="Overview" icon={ShieldCheckIcon}>
        <p>
          This Privacy Policy describes how Tipster Arena (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;the
          platform&rdquo;) handles information when you visit the site, create an account, or use our features.
        </p>
        <p>
          By using Tipster Arena, you acknowledge this policy alongside our{' '}
          <Link to={ROUTES.TERMS} className="text-accent-secondary hover:underline font-medium">
            Terms of Service
          </Link>
          . If you disagree, please discontinue use of the platform.
        </p>
      </LegalSection>

      <LegalSection id="collect" index={2} title="Information we collect" icon={CircleStackIcon}>
        <p>We collect information in three broad categories:</p>
        <div className="overflow-hidden rounded-xl border border-border-default/70 not-prose">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-elevated/80 text-xs uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Examples</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Why we need it</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/50">
              <tr>
                <td className="px-4 py-3 font-medium text-text-primary align-top">Account</td>
                <td className="px-4 py-3 text-text-muted align-top">
                  Email, username, display name, avatar, password (hashed), email verification status
                </td>
                <td className="px-4 py-3 text-text-muted align-top hidden md:table-cell">
                  Registration, login, profile, and account recovery
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-text-primary align-top">Competition</td>
                <td className="px-4 py-3 text-text-muted align-top">
                  Virtual bets, wallet transactions, leaderboard stats, season points, achievements, daily bet usage
                </td>
                <td className="px-4 py-3 text-text-muted align-top hidden md:table-cell">
                  Core gameplay, rankings, and season standings
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-text-primary align-top">Community</td>
                <td className="px-4 py-3 text-text-muted align-top">
                  Forum posts, comments, poll votes, post view counts, profile signature
                </td>
                <td className="px-4 py-3 text-text-muted align-top hidden md:table-cell">
                  Forum features, view-milestone rewards, and public profiles
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-text-primary align-top">Security</td>
                <td className="px-4 py-3 text-text-muted align-top">
                  Registration IP, verified IP, country (derived), 2FA settings, trusted devices, OAuth provider IDs
                </td>
                <td className="px-4 py-3 text-text-muted align-top hidden md:table-cell">
                  Fraud prevention, re-verification, and optional two-factor login
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-text-primary align-top">Preferences</td>
                <td className="px-4 py-3 text-text-muted align-top">
                  Email/push notification toggles, public profile visibility, connected social accounts
                </td>
                <td className="px-4 py-3 text-text-muted align-top hidden md:table-cell">
                  Settings and optional social sign-in (Google, Facebook)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="md:hidden text-xs text-text-muted">
          Each category supports a specific platform feature — we do not collect financial or payment-card data
          because Tipster Arena does not handle real-money wagers.
        </p>
      </LegalSection>

      <LegalSection id="use" index={3} title="How we use your information" icon={Cog6ToothIcon}>
        <p>We use collected information to:</p>
        <ul className="list-disc pl-5 space-y-2 marker:text-accent-secondary">
          <li>Authenticate you and maintain your session securely.</li>
          <li>Operate virtual betting, wallet history, bet settlement, and daily limits.</li>
          <li>Calculate leaderboard, season, and public profile statistics.</li>
          <li>Send in-app and email notifications you have enabled (e.g. bet results, verification).</li>
          <li>Publish forum content, track view milestones, and award forum bonus credits.</li>
          <li>Detect abuse, enforce our terms, and protect the integrity of competitions.</li>
          <li>Improve reliability, fix bugs, and develop new features.</li>
        </ul>
        <LegalCallout variant="accent">
          We do <strong className="text-text-primary">not</strong> use your data for real-money gambling, credit
          scoring, or selling lists to third-party marketers.
        </LegalCallout>
      </LegalSection>

      <LegalSection id="sharing" index={4} title="Sharing & service providers" icon={ServerStackIcon}>
        <p>
          We do not sell your personal information. We share data only when necessary to operate the platform:
        </p>
        <ul className="list-disc pl-5 space-y-2 marker:text-accent-secondary">
          <li>
            <strong className="text-text-primary">Infrastructure</strong> — cloud hosting and database providers
            (e.g. PostgreSQL) store encrypted data at rest in secured environments.
          </li>
          <li>
            <strong className="text-text-primary">Email delivery</strong> — SMTP services send verification,
            password-reset, and notification emails you trigger or opt into.
          </li>
          <li>
            <strong className="text-text-primary">Social sign-in</strong> — if you connect Google or Facebook, we
            receive profile basics from that provider per their policies; we do not post on your behalf.
          </li>
          <li>
            <strong className="text-text-primary">Sports data</strong> — fixture and odds APIs supply match
            information; your account details are not shared with them.
          </li>
          <li>
            <strong className="text-text-primary">Legal requirements</strong> — we may disclose information if
            required by law or to protect users and platform integrity.
          </li>
        </ul>
        <p>
          Public leaderboard entries, forum posts, and profiles marked public may be visible to other users and
          visitors as part of the competition experience.
        </p>
      </LegalSection>

      <LegalSection id="cookies" index={5} title="Cookies & local storage" icon={DevicePhoneMobileIcon}>
        <p>
          We use browser storage to keep you signed in and remember preferences. This typically includes:
        </p>
        <ul className="list-disc pl-5 space-y-2 marker:text-accent-secondary">
          <li>
            <strong className="text-text-primary">Authentication tokens</strong> — stored locally so you stay logged
            in between visits.
          </li>
          <li>
            <strong className="text-text-primary">Session & UI state</strong> — e.g. bet slip selections, tab
            preferences, and theme-related settings where applicable.
          </li>
          <li>
            <strong className="text-text-primary">Trusted device tokens</strong> — when you enable 2FA and choose
            to trust a device for 30 days.
          </li>
        </ul>
        <p>
          You can clear site data through your browser, but you will need to sign in again. We do not use
          third-party advertising cookies.
        </p>
      </LegalSection>

      <LegalSection id="security" index={6} title="How we protect data" icon={LockClosedIcon}>
        <p>Security measures include:</p>
        <ul className="list-disc pl-5 space-y-2 marker:text-accent-secondary">
          <li>Passwords stored as one-way hashes — never in plain text.</li>
          <li>Signed JSON Web Tokens (JWT) for authenticated API requests.</li>
          <li>Optional authenticator-app or SMS two-factor authentication.</li>
          <li>Email verification and IP-based re-verification for suspicious sign-ins.</li>
          <li>HTTPS in production environments between your browser and our servers.</li>
        </ul>
        <LegalCallout variant="warning">
          No system is 100% secure. Use a strong unique password, enable 2FA, and contact us if you suspect
          unauthorized access.
        </LegalCallout>
      </LegalSection>

      <LegalSection id="retention" index={7} title="How long we keep data" icon={ClockIcon}>
        <p>
          We retain information for as long as your account is active and as needed to provide the service, comply
          with legal obligations, resolve disputes, and enforce agreements.
        </p>
        <ul className="list-disc pl-5 space-y-2 marker:text-accent-secondary">
          <li>Account and competition history supports ongoing seasons and profile statistics.</li>
          <li>Security logs and verification tokens expire automatically after their purpose is served.</li>
          <li>Forum content may remain visible after account closure if required for community continuity — contact us for removal requests.</li>
        </ul>
      </LegalSection>

      <LegalSection id="choices" index={8} title="Your choices & rights" icon={UserCircleIcon}>
        <p>You can take the following actions directly in the app:</p>
        <ul className="list-disc pl-5 space-y-2 marker:text-accent-secondary">
          <li>
            Update display name, avatar, signature, and profile details in{' '}
            <Link to={ROUTES.PROFILE_EDIT} className="text-accent-secondary hover:underline font-medium">
              Profile settings
            </Link>
            .
          </li>
          <li>
            Control email/push notifications and profile visibility in{' '}
            <Link to={ROUTES.SETTINGS} className="text-accent-secondary hover:underline font-medium">
              Settings
            </Link>
            .
          </li>
          <li>Enable, disable, or change two-factor authentication methods.</li>
          <li>Link or unlink social accounts from connected-account settings.</li>
          <li>Mark notifications as read or manage notification history.</li>
        </ul>
        <p>
          For account deletion, data export, or correction requests not available in-app, contact us through the{' '}
          <Link to={ROUTES.HELP} className="text-accent-secondary hover:underline font-medium">
            Help Center
          </Link>
          . We will respond within a reasonable timeframe subject to applicable law.
        </p>
      </LegalSection>

      <LegalSection id="children" index={9} title="Age requirement" icon={EyeIcon}>
        <p>
          Tipster Arena is intended for users aged <strong className="text-text-primary">18 and older</strong>. We
          do not knowingly collect personal information from anyone under 18. If you believe a minor has registered,
          contact us so we can take appropriate action.
        </p>
      </LegalSection>

      <LegalSection id="transfers" index={10} title="International hosting" icon={GlobeAltIcon}>
        <p>
          Our infrastructure may process and store data in countries other than where you live (for example, cloud
          regions used by our database and hosting providers). By using the platform, you understand that your
          information may be transferred to facilities with different data-protection laws, and we apply appropriate
          safeguards consistent with this policy.
        </p>
      </LegalSection>

      <LegalSection id="changes" index={11} title="Changes to this policy" icon={BellIcon}>
        <p>
          We may update this Privacy Policy when we add features, change providers, or meet new legal requirements.
          The &ldquo;Last updated&rdquo; date at the top reflects the latest revision.
        </p>
        <p>
          Material changes may be communicated via in-app notification or email. Continued use after an update
          means you accept the revised policy.
        </p>
      </LegalSection>

      <LegalSection id="contact" index={12} title="Contact us" icon={ShieldCheckIcon}>
        <p>
          Questions about privacy, data access, or this policy? Visit the{' '}
          <Link to={ROUTES.HELP} className="text-accent-secondary hover:underline font-medium">
            Help Center
          </Link>{' '}
          or review our{' '}
          <Link to={ROUTES.TERMS} className="text-accent-secondary hover:underline font-medium">
            Terms of Service
          </Link>{' '}
          for broader platform rules.
        </p>
        <LegalCallout>
          This policy applies to Tipster Arena only. Third-party sites linked from our platform (social providers,
          external media URLs in forum posts) have their own privacy practices.
        </LegalCallout>
      </LegalSection>
    </LegalDocumentLayout>
  )
}
