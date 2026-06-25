import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminClient } from '@/core/api/client'
import { queryKeys } from '@/core/constants/queryKeys'
import type { ApiResponse } from '@/core/types/api'
import { Button } from '@/shared/components/ui/Button'
import { Card, Skeleton } from '@/shared/components/ui/Card'

interface CuratedLeague {
  id: string
  overtimeLeagueId: number
  name: string
  country: string
  sportId: string
  isEnabled: boolean
  sortOrder: number
}

export function LeaguesPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.leagues(),
    queryFn: async () => {
      const res = await adminClient.get<ApiResponse<CuratedLeague[]>>('/leagues', {
        params: { sportId: 'soccer' },
      })
      return res.data.data
    },
  })

  const syncMutation = useMutation({
    mutationFn: async () => {
      await adminClient.post('/leagues/sync')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.leagues() }),
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      await adminClient.patch(`/leagues/${id}`, { isEnabled })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.leagues() }),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Curated leagues</h1>
          <p className="text-sm text-text-muted">Soccer leagues shown in the main app sidebar.</p>
        </div>
        <Button onClick={() => syncMutation.mutate()} isLoading={syncMutation.isPending}>
          Sync from Overtime
        </Button>
      </div>

      <Card className="p-0 overflow-auto">
        {isLoading ? (
          <Skeleton className="h-48 m-4" />
        ) : !data?.length ? (
          <p className="p-4 text-sm text-text-muted">
            No curated leagues yet. Run sync to import from Overtime API.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-text-muted border-b border-border-default">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">League</th>
                <th className="p-3">Overtime ID</th>
                <th className="p-3">Enabled</th>
              </tr>
            </thead>
            <tbody>
              {data.map((league) => (
                <tr key={league.id} className="border-b border-border-default/50">
                  <td className="p-3 tabular-nums">{league.sortOrder}</td>
                  <td className="p-3">
                    <p className="font-medium">{league.name}</p>
                    <p className="text-xs text-text-muted">{league.country}</p>
                  </td>
                  <td className="p-3 tabular-nums">{league.overtimeLeagueId}</td>
                  <td className="p-3">
                    <Button
                      variant={league.isEnabled ? 'primary' : 'secondary'}
                      className="text-xs px-2 py-1"
                      onClick={() =>
                        toggleMutation.mutate({ id: league.id, isEnabled: !league.isEnabled })
                      }
                    >
                      {league.isEnabled ? 'Enabled' : 'Disabled'}
                    </Button>
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
