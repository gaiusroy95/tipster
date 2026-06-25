import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminClient } from '@/core/api/client'
import { queryKeys } from '@/core/constants/queryKeys'
import type { ApiResponse, Paginated } from '@/core/types/api'
import { Input } from '@/shared/components/ui/Input'
import { Card, Skeleton } from '@/shared/components/ui/Card'

interface BetRow {
  id: string
  user: { email: string; username: string }
  homeTeamName: string
  awayTeamName: string
  selectionLabel: string
  odds: number
  stake: number
  status: string
  placedAt: string
  leagueName?: string
}

export function BetsPage() {
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.bets({ status, search }),
    queryFn: async () => {
      const res = await adminClient.get<ApiResponse<Paginated<BetRow>>>('/bets', {
        params: {
          status: status || undefined,
          search: search || undefined,
          limit: 50,
        },
      })
      return res.data.data
    },
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Bets</h1>
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search teams or selection…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
          <option value="void">Void</option>
        </select>
      </div>

      <Card className="p-0 overflow-auto">
        {isLoading ? (
          <Skeleton className="h-48 m-4" />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-text-muted border-b border-border-default">
              <tr>
                <th className="p-3">Match</th>
                <th className="p-3">Selection</th>
                <th className="p-3">User</th>
                <th className="p-3">Stake</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((bet) => (
                <tr key={bet.id} className="border-b border-border-default/50">
                  <td className="p-3">
                    <p>
                      {bet.homeTeamName} vs {bet.awayTeamName}
                    </p>
                    <p className="text-xs text-text-muted">{bet.leagueName}</p>
                  </td>
                  <td className="p-3">
                    {bet.selectionLabel} @ {bet.odds}
                  </td>
                  <td className="p-3">{bet.user.username}</td>
                  <td className="p-3 tabular-nums">{bet.stake}</td>
                  <td className="p-3">{bet.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
