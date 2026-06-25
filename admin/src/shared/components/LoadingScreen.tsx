import { cn } from '@/shared/utils/cn'
import { AppLogo } from '@/shared/components/AppLogo'

export function LoadingScreen({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 auth-backdrop p-6">
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-0 rounded-full bg-accent-secondary/20 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative rounded-2xl border border-border-default/70 bg-bg-surface/80 p-4 shadow-[var(--shadow-elevated)]">
          <AppLogo size="md" variant="mark" />
        </div>
      </div>
      <p className={cn('text-sm text-text-muted animate-pulse')}>{message}</p>
    </div>
  )
}
