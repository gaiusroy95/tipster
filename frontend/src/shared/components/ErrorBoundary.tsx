import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/shared/components/ui/Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
          <h2 className="text-lg font-semibold">Unexpected error</h2>
          <p className="mt-2 text-text-muted text-sm">Please refresh the page.</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      )
    }
    return this.props.children
  }
}
