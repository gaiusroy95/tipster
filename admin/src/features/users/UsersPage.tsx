import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminClient } from '@/core/api/client'
import { queryKeys } from '@/core/constants/queryKeys'
import type { AdminUser, ApiResponse, Paginated } from '@/core/types/api'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Card, Skeleton } from '@/shared/components/ui/Card'

export function UsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [balanceAdj, setBalanceAdj] = useState('')
  const [banReason, setBanReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.users({ search }),
    queryFn: async () => {
      const res = await adminClient.get<ApiResponse<Paginated<AdminUser>>>('/users', {
        params: { search: search || undefined, limit: 50 },
      })
      return res.data.data
    },
  })

  const selected = data?.items.find((u) => u.id === selectedId)

  const updateMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await adminClient.patch<ApiResponse<AdminUser>>(`/users/${selectedId}`, payload)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })

  const verifyMutation = useMutation({
    mutationFn: async () => {
      await adminClient.post(`/users/${selectedId}/verify-email`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <Input
        placeholder="Search email, username…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-auto max-h-[70vh] p-0">
          {isLoading ? (
            <Skeleton className="h-64 m-4" />
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-text-muted border-b border-border-default">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Balance</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((user) => (
                  <tr
                    key={user.id}
                    className={`border-b border-border-default/50 cursor-pointer hover:bg-bg-elevated/50 ${selectedId === user.id ? 'bg-bg-elevated' : ''}`}
                    onClick={() => setSelectedId(user.id)}
                  >
                    <td className="p-3">
                      <p className="font-medium">{user.displayName}</p>
                      <p className="text-xs text-text-muted">{user.email}</p>
                      {user.isBanned ? (
                        <span className="text-xs text-accent-loss">Banned</span>
                      ) : null}
                    </td>
                    <td className="p-3">{user.role}</td>
                    <td className="p-3 tabular-nums">{user.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card className="space-y-3">
          {!selected ? (
            <p className="text-text-muted text-sm">Select a user to manage.</p>
          ) : (
            <>
              <h2 className="font-semibold">{selected.displayName}</h2>
              <p className="text-sm text-text-muted">@{selected.username}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    updateMutation.mutate({
                      role: selected.role === 'ADMIN' ? 'USER' : 'ADMIN',
                    })
                  }
                >
                  {selected.role === 'ADMIN' ? 'Demote to user' : 'Promote to admin'}
                </Button>
                <Button
                  variant={selected.isBanned ? 'secondary' : 'danger'}
                  onClick={() =>
                    updateMutation.mutate({
                      isBanned: !selected.isBanned,
                      banReason: selected.isBanned ? null : banReason || 'Suspended by admin',
                    })
                  }
                >
                  {selected.isBanned ? 'Unban' : 'Ban'}
                </Button>
                <Button variant="ghost" onClick={() => verifyMutation.mutate()}>
                  Force verify email
                </Button>
              </div>
              {!selected.isBanned ? (
                <Input
                  placeholder="Ban reason (optional)"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
              ) : null}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-text-muted">Balance adjustment</label>
                  <Input
                    type="number"
                    placeholder="e.g. 100 or -50"
                    value={balanceAdj}
                    onChange={(e) => setBalanceAdj(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => {
                    const n = Number(balanceAdj)
                    if (!Number.isFinite(n) || n === 0) return
                    updateMutation.mutate({ balanceAdjustment: n, balanceReason: 'Admin adjustment' })
                    setBalanceAdj('')
                  }}
                >
                  Apply
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
