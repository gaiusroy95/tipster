import { Card, CardContent } from '@/shared/components/ui/Card'
import { cn } from '@/shared/utils/cn'

interface StatCardProps {
  label: string
  value: string
  subValue?: string
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function StatCard({ label, value, subValue, trend, className }: StatCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="pt-4">
        <p className="text-sm text-text-muted">{label}</p>
        <p
          className={cn(
            'text-2xl font-bold font-mono mt-1',
            trend === 'up' && 'text-accent-win',
            trend === 'down' && 'text-accent-loss',
          )}
        >
          {value}
        </p>
        {subValue && <p className="text-xs text-text-muted mt-1">{subValue}</p>}
      </CardContent>
    </Card>
  )
}
