import {
  ClockIcon,
  DocumentTextIcon,
  HashtagIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'
import type { ForumCategory, PopularTag } from '@/features/forum/types/forum'
import { cn } from '@/shared/utils/cn'

export type ForumTab = 'published' | 'drafts' | 'scheduled'

interface ForumSidebarProps {
  tab: ForumTab
  onTabChange: (tab: ForumTab) => void
  isAuthenticated: boolean
  categories?: ForumCategory[]
  popularTags?: PopularTag[]
  activeCategory: string
  activeTag: string
  onCategoryChange: (slug: string) => void
  onTagChange: (tag: string) => void
  postCount?: number
}

const tabs: { id: ForumTab; label: string; icon: typeof DocumentTextIcon; authOnly?: boolean }[] = [
  { id: 'published', label: 'All posts', icon: Squares2X2Icon },
  { id: 'drafts', label: 'Drafts', icon: DocumentTextIcon, authOnly: true },
  { id: 'scheduled', label: 'Scheduled', icon: ClockIcon, authOnly: true },
]

function SidebarSection({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof HashtagIcon
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border-default/70 bg-bg-surface p-4">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
        <Icon className="h-4 w-4 text-accent-secondary" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  )
}

export function ForumSidebar({
  tab,
  onTabChange,
  isAuthenticated,
  categories,
  popularTags,
  activeCategory,
  activeTag,
  onCategoryChange,
  onTagChange,
  postCount,
}: ForumSidebarProps) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <SidebarSection title="Browse" icon={Squares2X2Icon}>
        <nav className="space-y-1" aria-label="Forum sections">
          {tabs.map(({ id, label, icon: Icon, authOnly }) => {
            const disabled = authOnly && !isAuthenticated
            const active = tab === id
            return (
              <button
                key={id}
                type="button"
                disabled={disabled}
                onClick={() => onTabChange(id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                  active
                    ? 'bg-accent-secondary/15 text-accent-secondary border border-accent-secondary/25'
                    : 'text-text-muted hover:bg-bg-elevated hover:text-text-primary border border-transparent',
                  disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-text-muted',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </button>
            )
          })}
        </nav>
        {tab === 'published' && postCount !== undefined && (
          <p className="mt-3 border-t border-border-default/50 pt-3 text-xs text-text-muted">
            {postCount} {postCount === 1 ? 'post' : 'posts'} in feed
          </p>
        )}
      </SidebarSection>

      {tab === 'published' && categories && categories.length > 0 && (
        <SidebarSection title="Categories" icon={Squares2X2Icon}>
          <ul className="space-y-1">
            <li>
              <button
                type="button"
                onClick={() => onCategoryChange('')}
                className={cn(
                  'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  !activeCategory
                    ? 'bg-bg-elevated font-medium text-text-primary'
                    : 'text-text-muted hover:bg-bg-elevated/60 hover:text-text-primary',
                )}
              >
                All categories
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => onCategoryChange(cat.slug)}
                  className={cn(
                    'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    activeCategory === cat.slug
                      ? 'bg-accent-secondary/10 font-medium text-accent-secondary'
                      : 'text-text-muted hover:bg-bg-elevated/60 hover:text-text-primary',
                  )}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </SidebarSection>
      )}

      {tab === 'published' && popularTags && popularTags.length > 0 && (
        <SidebarSection title="Popular tags" icon={HashtagIcon}>
          <div className="flex flex-wrap gap-1.5">
            {activeTag && (
              <button
                type="button"
                onClick={() => onTagChange('')}
                className="rounded-full border border-border-default px-2.5 py-1 text-xs text-text-muted hover:border-accent-secondary/40 hover:text-accent-secondary"
              >
                Clear
              </button>
            )}
            {popularTags.map(({ tag, count }) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagChange(activeTag === tag ? '' : tag)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                  activeTag === tag
                    ? 'border-accent-secondary/50 bg-accent-secondary/15 text-accent-secondary'
                    : 'border-border-default/70 bg-bg-elevated/40 text-text-muted hover:border-accent-secondary/30 hover:text-text-primary',
                )}
              >
                #{tag}
                <span className="ml-1 opacity-60">{count}</span>
              </button>
            ))}
          </div>
        </SidebarSection>
      )}
    </aside>
  )
}
