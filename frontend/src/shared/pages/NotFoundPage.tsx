import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { ROUTES } from '@/core/constants/routes'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl font-bold text-accent-primary">404</h1>
      <p className="mt-4 text-lg text-text-muted">Page not found</p>
      <Link to={ROUTES.HOME} className="mt-6">
        <Button>Go home</Button>
      </Link>
    </div>
  )
}
