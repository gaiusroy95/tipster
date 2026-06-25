import { useQuery } from '@tanstack/react-query'
import { adminClient } from '@/core/api/client'
import { queryKeys } from '@/core/constants/queryKeys'
import type { ApiResponse, Paginated } from '@/core/types/api'
import { Card, Skeleton } from '@/shared/components/ui/Card'

interface AuditEntry {
  id: string
  action: string
  entityType: string
  entityId?: string
  createdAt: string
  admin: { email: string; displayName: string }
  metadata?: Record<string, unknown>
}

export function AuditLogPage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.audit({}),
    queryFn: async () => {
      const res = await adminClient.get<ApiResponse<Paginated<AuditEntry>>>('/audit-logs', {
        params: { limit: 100 },
      })
      return res.data.data
    },
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Audit log</h1>
      <Card className="p-0 overflow-auto max-h-[75vh]">
        {isLoading ? (
          <Skeleton className="h-48 m-4" />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-text-muted border-b border-border-default sticky top-0 bg-bg-surface">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Admin</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((entry) => (
                <tr key={entry.id} className="border-b border-border-default/50">
                  <td className="p-3 whitespace-nowrap text-text-muted">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3">{entry.admin.displayName}</td>
                  <td className="p-3 font-medium">{entry.action}</td>
                  <td className="p-3 text-text-muted">
                    {entry.entityType}
                    {entry.entityId ? ` · ${entry.entityId.slice(0, 8)}…` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
