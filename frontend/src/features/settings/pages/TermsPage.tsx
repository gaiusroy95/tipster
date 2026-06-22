import { Link } from 'react-router-dom'
import { ROUTES } from '@/core/constants/routes'

export function TermsPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
      <p className="text-text-muted mb-6">
        Tipster Arena is a virtual sports betting competition platform. No real money is involved.
      </p>

      <section className="space-y-4 text-sm text-text-muted">
        <h2 className="text-lg font-semibold text-text-primary">Virtual credits only</h2>
        <p>
          All bets use virtual credits with no monetary value. Credits cannot be exchanged for cash
          or transferred. Physical prizes are awarded offline by administrators at season end.
        </p>

        <h2 className="text-lg font-semibold text-text-primary">Competition rules</h2>
        <p>
          Users compete on a seasonal leaderboard based on points, ROI, and profit/loss from virtual
          bets. Betting rules include small and big bet limits and daily big bet caps as displayed in
          the wallet section.
        </p>

        <h2 className="text-lg font-semibold text-text-primary">Responsible participation</h2>
        <p>
          This platform simulates sports betting for entertainment and skill competition. It is not
          a gambling service. Users must be 18+ to participate.
        </p>
      </section>

      <Link to={ROUTES.LOGIN} className="inline-block mt-8 text-accent-primary hover:underline">
        Back to sign in
      </Link>
    </div>
  )
}
