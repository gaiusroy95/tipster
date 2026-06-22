import { Button } from '@/shared/components/ui/Button'

interface QueryErrorFallbackProps {
  message?: string
  onRetry?: () => void
}

export function QueryErrorFallback({ message = 'Something went wrong', onRetry }: QueryErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center" role="alert">
      <p className="text-accent-loss font-medium">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>Try again</Button>
      )}
    </div>
  )
}
