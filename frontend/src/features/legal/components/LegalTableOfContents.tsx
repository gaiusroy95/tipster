import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { ROUTES } from '@/core/constants/routes'
import { cn } from '@/shared/utils/cn'

export interface LegalTocItem {
  id: string
  label: string
}

export function LegalTableOfContents({ items, className }: { items: LegalTocItem[]; className?: string }) {
  return (
    <nav
      aria-label="Table of contents"
      className={cn(
        'rounded-xl border border-border-default/70 bg-bg-surface p-4 shadow-card',
        className,
      )}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">On this page</p>
      <ol className="space-y-1">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-text-muted transition-colors hover:bg-bg-elevated hover:text-accent-secondary"
            >
              <span className="font-mono text-[10px] text-text-muted/70 group-hover:text-accent-secondary">
                {String(i + 1).padStart(2, '0')}
              </span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
      <Link
        to={ROUTES.HOME}
        className="mt-4 flex items-center gap-1.5 border-t border-border-default/50 pt-4 text-xs font-medium text-accent-secondary hover:text-accent-primary transition-colors"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Back to arena
      </Link>
    </nav>
  )
}

export function LegalTableOfContentsMobile({ items }: { items: LegalTocItem[] }) {
  return (
    <div className="lg:hidden rounded-xl border border-border-default/70 bg-bg-surface p-3">
      <label htmlFor="legal-toc-select" className="sr-only">
        Jump to section
      </label>
      <select
        id="legal-toc-select"
        className="w-full rounded-lg border border-border-default bg-bg-elevated px-3 py-2.5 text-sm text-text-primary"
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) {
            document.getElementById(e.target.value)?.scrollIntoView({ behavior: 'smooth' })
            e.target.value = ''
          }
        }}
      >
        <option value="" disabled>
          Jump to section…
        </option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  )
}
