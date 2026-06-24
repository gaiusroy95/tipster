import {
  ChatBubbleLeftRightIcon,
  EyeIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/shared/components/ui/Button'
import { FORUM_VIEW_REWARD, FORUM_VIEW_TARGET } from '@/features/forum/types/forum'
import { cn } from '@/shared/utils/cn'

interface ForumPageHeaderProps {
  isAuthenticated: boolean
  showComposer: boolean
  onToggleComposer: () => void
  onSignIn: () => void
}

export function ForumPageHeader({
  isAuthenticated,
  showComposer,
  onToggleComposer,
  onSignIn,
}: ForumPageHeaderProps) {
  return (
    <header
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border-default bg-bg-surface shadow-card',
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 100% 0%, rgba(99,102,241,0.22) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 0% 100%, rgba(245,158,11,0.12) 0%, transparent 50%)',
        }}
      />

      <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-secondary/30 bg-accent-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-secondary">
            <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Community
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Tipster Forum
            </h1>
            <p className="mt-1.5 max-w-xl text-sm sm:text-base text-text-muted leading-relaxed">
              Share picks, strategy, and analysis. Build your reputation and earn credits as your posts gain traction.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border-default/80 bg-bg-elevated/60 px-3 py-1.5 text-xs text-text-muted">
              <EyeIcon className="h-3.5 w-3.5 text-accent-secondary" aria-hidden="true" />
              <span>
                <strong className="font-semibold text-text-primary">{FORUM_VIEW_TARGET.toLocaleString()}</strong> views
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-accent-gold/25 bg-accent-gold/5 px-3 py-1.5 text-xs text-text-muted">
              <SparklesIcon className="h-3.5 w-3.5 text-accent-gold" aria-hidden="true" />
              <span>
                <strong className="font-semibold text-accent-gold">{FORUM_VIEW_REWARD.toLocaleString()}</strong> credits per milestone
              </span>
            </span>
          </div>
        </div>

        <div className="shrink-0">
          {isAuthenticated ? (
            <Button
              size="lg"
              onClick={onToggleComposer}
              className="w-full sm:w-auto min-w-[140px]"
            >
              {showComposer ? 'Close editor' : 'Write a post'}
            </Button>
          ) : (
            <Button size="lg" variant="secondary" onClick={onSignIn} className="w-full sm:w-auto">
              Sign in to participate
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
