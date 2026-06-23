import { ContentPage } from '@/features/legal/pages/LegalPages'

export function TermsPage() {
  return (
    <ContentPage
      title="Terms of Service"
      description="Tipster Arena is a virtual sports betting competition platform. No real money is involved."
    >
      <section>
        <h2 className="text-base font-semibold text-text-primary mb-2">Virtual credits only</h2>
        <p>
          All bets use virtual credits with no monetary value. Credits cannot be exchanged for cash
          or transferred. Physical prizes are awarded offline by administrators at season end.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold text-text-primary mb-2">Competition rules</h2>
        <p>
          New accounts receive 1,000,000 virtual credits. Each bet must be exactly 25,000 or
          100,000 credits, with a maximum of three bets per day.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold text-text-primary mb-2">Responsible participation</h2>
        <p>
          This platform simulates sports betting for entertainment and skill competition. It is not
          a gambling service. Users must be 18+ to participate.
        </p>
      </section>
    </ContentPage>
  )
}
