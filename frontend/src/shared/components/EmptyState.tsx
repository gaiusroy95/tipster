import { type ReactNode } from 'react'
import { Button } from '@/shared/components/ui/Button'

interface EmptyStateProps {
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  icon?: ReactNode
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-4 text-text-muted">{icon}</div>}
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      {description && <p className="mt-2 text-sm text-text-muted max-w-sm">{description}</p>}
      {action && (
        <Button className="mt-6" onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}
