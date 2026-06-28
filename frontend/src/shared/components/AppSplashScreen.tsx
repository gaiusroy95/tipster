import { useEffect, useState } from 'react'
import { AppLogo } from '@/shared/components/AppLogo'
import { cn } from '@/shared/utils/cn'

const FADE_MS = 300

export function AppSplashScreen({
  exiting,
  onExited,
}: {
  exiting: boolean
  onExited: () => void
}) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!exiting) return

    const timer = setTimeout(() => {
      setHidden(true)
      onExited()
    }, FADE_MS)

    return () => clearTimeout(timer)
  }, [exiting, onExited])

  if (hidden) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary',
        'transition-opacity duration-300 ease-out motion-reduce:transition-none',
        exiting ? 'opacity-0 pointer-events-none' : 'opacity-100',
      )}
      aria-busy={!exiting}
      aria-live="polite"
      aria-label={exiting ? undefined : 'Loading Tipster Arena'}
    >
      <AppLogo
        size="lg"
        variant="full"
        className="object-center mx-auto animate-pulse motion-reduce:animate-none"
      />
    </div>
  )
}
