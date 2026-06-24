import { Link } from 'react-router-dom'
import {
  BanknotesIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  FlagIcon,
  ScaleIcon,
  TicketIcon,
  TrophyIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import {
  bettingRules,
  calculateCancellationPenalty,
  getStakeLabel,
} from '@/core/config/bettingRules'
import { ROUTES } from '@/core/constants/routes'
import { FORUM_VIEW_REWARD, FORUM_VIEW_TARGET } from '@/features/forum/types/forum'
import { LegalCallout } from '@/features/legal/components/LegalCallout'
import { LegalDocumentLayout } from '@/features/legal/components/LegalDocumentLayout'
import { LegalPageHero, LegalRelatedLinks } from '@/features/legal/components/LegalPageHero'
import { LegalSection } from '@/features/legal/components/LegalSection'
import { LegalSummaryGrid } from '@/features/legal/components/LegalSummaryGrid'

const LAST_UPDATED = '2026-06-24'

const TOC = [
  { id: 'overview', label: 'Overview' },
  { id: 'credits', label: 'Virtual credits' },
  { id: 'betting', label: 'Placing bets' },
  { id: 'markets', label: 'Markets & odds' },
  { id: 'settlement', label: 'Settlement' },
  { id: 'cancellation', label: 'Cancellation' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'seasons', label: 'Seasons & prizes' },
  { id: 'forum', label: 'Forum rewards' },
  { id: 'fair-play', label: 'Fair play' },
  { id: 'disputes', label: 'Disputes' },
] as const

const fmt = (n: number) => n.toLocaleString()

export function RulesPage() {
  const penalty25k = calculateCancellationPenalty(bettingRules.standardStake)
  const penalty100k = calculateCancellationPenalty(bettingRules.premiumStake)

  return (
    <LegalDocumentLayout
      hero={
        <LegalPageHero
          eyebrow="Competition"
          title="Arena Rules"
          description="Official rules for virtual betting, rankings, and seasons — everything you need to compete fairly on Tipster Arena."
          lastUpdated={LAST_UPDATED}
          readingMinutes={5}
        />
      }
      summary={
        <LegalSummaryGrid
          items={[
            {
              icon: CurrencyDollarIcon,
              title: `${fmt(bettingRules.initialBalance)} welcome credits`,
              description: 'Every new account starts with the same virtual balance. No purchases required.',
              accent: 'gold',
            },
            {
              icon: TicketIcon,
              title: `${getStakeLabel(bettingRules.standardStake)} / ${getStakeLabel(bettingRules.premiumStake)} stakes`,
              description: 'Only two stake sizes are allowed — pick small or big for each selection.',
              accent: 'secondary',
            },
            {
              icon: ClockIcon,
              title: `${bettingRules.dailyBetLimit} bets per day`,
              description: 'Daily cap resets at midnight in your local calendar day.',
              accent: 'live',
            },
            {
              icon: TrophyIcon,
              title: 'Season rankings',
              description: 'Climb the leaderboard with profit, ROI, and consistency over each season.',
              accent: 'win',
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
              description: 'Platform agreement and participation terms.',
            },
            {
              label: 'Privacy Policy',
              to: ROUTES.PRIVACY,
              description: 'How your account and activity data is handled.',
            },
            {
              label: 'Help Center',
              to: ROUTES.HELP,
              description: 'Step-by-step guides for new tipsters.',
            },
          ]}
        />
      }
    >
      <LegalCallout variant="accent" title="Virtual competition only">
        Tipster Arena uses <strong className="text-text-primary">virtual credits with no cash value</strong>.
        These rules govern in-app competition — not real-money gambling. Physical prizes are awarded offline
        by administrators when seasons end.
      </LegalCallout>

      <LegalSection id="overview" index={1} title="Overview" icon={FlagIcon}>
        <p>
          Arena Rules define how virtual betting, wallet transactions, rankings, and seasons work on Tipster
          Arena. All participants must follow these rules in addition to our{' '}
          <Link to={ROUTES.TERMS} className="text-accent-secondary hover:underline font-medium">
            Terms of Service
          </Link>
          .
        </p>
        <p>
          The goal is a level playing field: fixed stakes, daily limits, transparent settlement, and public
          leaderboards so skill — not bankroll size — determines who rises.
        </p>
      </LegalSection>

      <LegalSection id="credits" index={2} title="Virtual credits" icon={BanknotesIcon}>
        <p>
          Credits are the in-app currency for placing bets and tracking performance. They cannot be bought,
          sold, withdrawn, or transferred between accounts.
        </p>
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
                <td className="px-4 py-3 font-medium text-text-primary">Welcome balance</td>
                <td className="px-4 py-3 text-text-muted">{fmt(bettingRules.initialBalance)} credits on registration</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-text-primary">Cash value</td>
                <td className="px-4 py-3 text-text-muted">None — credits are for competition scoring only</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-text-primary">Transactions</td>
                <td className="px-4 py-3 text-text-muted">All debits and credits appear in your Wallet history</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-text-primary">Bonus credits</td>
                <td className="px-4 py-3 text-text-muted">Forum view milestones and admin adjustments (see Forum rewards)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection id="betting" index={3} title="Placing bets" icon={TicketIcon}>
        <p>Every bet must meet these requirements before it is accepted:</p>
        <ul className="list-disc pl-5 space-y-2 marker:text-accent-secondary">
          <li>
            Stake is exactly{' '}
            <strong className="text-text-primary">{fmt(bettingRules.standardStake)}</strong> (
            {getStakeLabel(bettingRules.standardStake)}) or{' '}
            <strong className="text-text-primary">{fmt(bettingRules.premiumStake)}</strong> (
            {getStakeLabel(bettingRules.premiumStake)}) credits.
          </li>
          <li>
            You have not exceeded the daily limit of{' '}
            <strong className="text-text-primary">{bettingRules.dailyBetLimit} bets</strong> for the current
            calendar day.
          </li>
          <li>Your wallet balance covers the full stake at placement time.</li>
          <li>The fixture is open for betting (not started or suspended).</li>
        </ul>
        <LegalCallout variant="info">
          Potential return is calculated from the displayed odds at placement. Once confirmed, the stake is
          deducted immediately from your balance.
        </LegalCallout>
      </LegalSection>

      <LegalSection id="markets" index={4} title="Markets & odds" icon={ChartBarIcon}>
        <p>
          Tipster Cup fixtures offer standard markets such as match winner, handicap, and over/under where
          available. Odds are supplied by our sports data partner and may update until kickoff.
        </p>
        <ul className="list-disc pl-5 space-y-2 marker:text-accent-secondary">
          <li>Odds shown on the bet slip at confirmation are locked for your bet.</li>
          <li>Markets may be removed or suspended without notice if data is unavailable.</li>
          <li>Live fixtures follow the same stake and daily-limit rules as pre-match bets.</li>
        </ul>
      </LegalSection>

      <LegalSection id="settlement" index={5} title="Settlement & results" icon={ClipboardDocumentCheckIcon}>
        <p>
          Bets settle automatically when official match results are confirmed. Your wallet and bet history
          update accordingly.
        </p>
        <div className="overflow-hidden rounded-xl border border-border-default/70">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-elevated/80 text-xs uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Outcome</th>
                <th className="px-4 py-3 font-semibold">Effect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/50">
              <tr>
                <td className="px-4 py-3 font-medium text-accent-win">Won</td>
                <td className="px-4 py-3 text-text-muted">Potential return credited to your wallet</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-accent-loss">Lost</td>
                <td className="px-4 py-3 text-text-muted">Stake already deducted — no further charge</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-text-primary">Void / cancelled event</td>
                <td className="px-4 py-3 text-text-muted">Stake refunded in full where applicable</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Settlement may take a short time after the final whistle while results are verified. Active bets
          appear on your profile and in Active Bets until settled.
        </p>
      </LegalSection>

      <LegalSection id="cancellation" index={6} title="Bet cancellation" icon={XCircleIcon}>
        <p>
          You may cancel an <strong className="text-text-primary">active</strong> bet before the event starts,
          subject to a penalty on the stake:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border-default/70 bg-bg-elevated/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {getStakeLabel(bettingRules.standardStake)} stake
            </p>
            <p className="mt-1 font-display text-lg font-bold text-text-primary">
              {fmt(penalty25k)} credit penalty
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {bettingRules.cancellationPenaltyPercent}% of {fmt(bettingRules.standardStake)}
            </p>
          </div>
          <div className="rounded-xl border border-border-default/70 bg-bg-elevated/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {getStakeLabel(bettingRules.premiumStake)} stake
            </p>
            <p className="mt-1 font-display text-lg font-bold text-text-primary">
              {fmt(penalty100k)} credit penalty
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {bettingRules.cancellationPenaltyPercent}% of {fmt(bettingRules.premiumStake)}
            </p>
          </div>
        </div>
        <p>
          After kickoff, bets cannot be cancelled. The remaining stake (after penalty) is returned to your
          wallet.
        </p>
      </LegalSection>

      <LegalSection id="leaderboard" index={7} title="Leaderboard & stats" icon={ChartBarIcon}>
        <p>
          The leaderboard ranks tipsters by season performance. Sort options include points, ROI, profit/loss,
          and win rate.
        </p>
        <ul className="list-disc pl-5 space-y-2 marker:text-accent-secondary">
          <li>Public profiles display form, achievements, and betting history (subject to privacy settings).</li>
          <li>Stats update as bets settle — only settled results count toward rankings.</li>
          <li>Search and filter help you compare performance across the active season.</li>
        </ul>
      </LegalSection>

      <LegalSection id="seasons" index={8} title="Seasons & prizes" icon={CalendarDaysIcon}>
        <p>
          Seasons run on a published schedule with defined start and end dates. One season is marked active
          at a time for primary rankings.
        </p>
        <ul className="list-disc pl-5 space-y-2 marker:text-accent-secondary">
          <li>Season points and rank are tracked per participant in the active season.</li>
          <li>Prize tiers describe offline physical rewards — not in-app credit payouts.</li>
          <li>Administrators verify eligibility and distribute prizes outside the platform wallet.</li>
        </ul>
        <LegalCallout variant="warning">
          Season dates and prize descriptions may change between seasons. Always check the current season
          page before competing.
        </LegalCallout>
      </LegalSection>

      <LegalSection id="forum" index={9} title="Forum view rewards" icon={TrophyIcon}>
        <p>
          Published forum posts can earn bonus virtual credits through the view-milestone programme:
        </p>
        <LegalCallout variant="info">
          <strong className="text-text-primary">{fmt(FORUM_VIEW_REWARD)} credits</strong> awarded for each{' '}
          {fmt(FORUM_VIEW_TARGET)} cumulative views on your published posts. Milestones repeat. Self-views do
          not count. Bonus credits follow the same virtual-credit rules as welcome balance.
        </LegalCallout>
      </LegalSection>

      <LegalSection id="fair-play" index={10} title="Fair play" icon={ScaleIcon}>
        <p>The following are prohibited and may result in bet voiding, balance adjustment, or account suspension:</p>
        <ul className="list-disc pl-5 space-y-2 marker:text-accent-secondary">
          <li>Multiple accounts used to bypass daily limits or manipulate rankings.</li>
          <li>Automated betting, scraping, or exploit abuse of odds or settlement bugs.</li>
          <li>Collusion with other users to fix outcomes or share accounts.</li>
          <li>Harassment or spam in forum or profile content linked to competition manipulation.</li>
        </ul>
      </LegalSection>

      <LegalSection id="disputes" index={11} title="Disputes & rule changes" icon={ClipboardDocumentCheckIcon}>
        <p>
          If you believe a bet was settled incorrectly, contact us through the{' '}
          <Link to={ROUTES.HELP} className="text-accent-secondary hover:underline font-medium">
            Help Center
          </Link>{' '}
          with the bet ID and details. We review cases where data provider errors are suspected.
        </p>
        <p>
          Arena Rules may be updated as features evolve. The last updated date at the top of this page reflects
          the current version. Continued participation after changes means you accept the updated rules.
        </p>
      </LegalSection>
    </LegalDocumentLayout>
  )
}
