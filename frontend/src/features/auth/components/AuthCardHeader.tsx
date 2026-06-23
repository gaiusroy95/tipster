import { AppLogo } from '@/shared/components/AppLogo'
import { CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { cn } from '@/shared/utils/cn'

export function AuthCardHeader({
  title,
  subtitle,
  className,
}: {
  title: string
  subtitle?: string
  className?: string
}) {
  return (
    <CardHeader className={cn('text-center px-6 pt-8 pb-6', className)}>
      <div className="flex flex-col items-center gap-5">
        <div className="relative flex items-center justify-center">
          <div
            className="pointer-events-none absolute h-20 w-20 rounded-full bg-accent-secondary/20 blur-3xl"
            aria-hidden="true"
          />
          <div
            className={cn(
              'relative flex h-[5.5rem] w-[5.5rem] sm:h-24 sm:w-24 items-center justify-center',
              'rounded-2xl border border-border-default/70 bg-bg-elevated/60',
              'shadow-[0_0_40px_rgba(99,102,241,0.12)]',
            )}
          >
            <AppLogo
              size="lg"
              variant="mark"
              className="h-[3.25rem] w-auto sm:h-14 max-w-none"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <CardTitle className="text-2xl font-display font-bold tracking-tight">
            {title}
          </CardTitle>
          <p className="text-sm text-text-muted">{subtitle ?? 'Virtual tipster league'}</p>
        </div>
      </div>
    </CardHeader>
  )
}
