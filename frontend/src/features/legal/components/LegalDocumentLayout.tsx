import type { ReactNode } from 'react'
import {
  LegalTableOfContents,
  LegalTableOfContentsMobile,
} from '@/features/legal/components/LegalTableOfContents'

export function LegalDocumentLayout({
  hero,
  summary,
  tocItems,
  children,
  relatedLinks,
}: {
  hero: ReactNode
  summary?: ReactNode
  tocItems: { id: string; label: string }[]
  children: ReactNode
  relatedLinks?: ReactNode
}) {
  return (
    <div className="space-y-6 pb-10 max-w-6xl mx-auto">
      {hero}
      {summary}
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
        <LegalTableOfContents items={tocItems} className="hidden lg:block lg:sticky lg:top-24 lg:self-start" />
        <div className="min-w-0 space-y-8">
          <LegalTableOfContentsMobile items={tocItems} />
          <div className="rounded-2xl border border-border-default/70 bg-bg-surface shadow-card p-5 sm:p-8 space-y-10">
            {children}
          </div>
          {relatedLinks}
        </div>
      </div>
    </div>
  )
}
