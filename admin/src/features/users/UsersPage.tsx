import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminClient } from '@/core/api/client'
import { queryKeys } from '@/core/constants/queryKeys'
import type { AdminUser, ApiResponse, Paginated } from '@/core/types/api'
import { UserDetailPanel } from '@/features/users/components/UserDetailPanel'
import { UserListPanel } from '@/features/users/components/UserListPanel'
import { UsersPageHeader } from '@/features/users/components/UsersPageHeader'
import {
  filterParams,
  sortParams,
  summarizeUsers,
  type UserFilter,
  type UserSort,
} from '@/features/users/lib/userUtils'
import { Skeleton } from '@/shared/components/ui/Card'
import { AdminPageShell } from '@/shared/components/AdminPageShell'
import { cn } from '@/shared/utils/cn'

export function UsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<UserFilter>('all')
  const [sort, setSort] = useState<UserSort>('newest')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)
  const [balanceAdj, setBalanceAdj] = useState('')
  const [banReason, setBanReason] = useState('')

  const listParams = {
    search: search || undefined,
    limit: 50,
    ...filterParams(filter),
    ...sortParams(sort),
  }

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.users(listParams),
    queryFn: async () => {
      const res = await adminClient.get<ApiResponse<Paginated<AdminUser>>>('/users', {
        params: listParams,
      })
      return res.data.data
    },
  })

  const users = data?.items ?? []
  const selected = users.find((u) => u.id === selectedId) ?? null
  const summary = summarizeUsers(users, data?.total ?? 0)

  useEffect(() => {
    if (users.length === 0) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !users.some((u) => u.id === selectedId)) {
      setSelectedId(users[0].id)
    }
  }, [users, selectedId])

  const updateMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (!selectedId) throw new Error('No user selected')
      const res = await adminClient.patch<ApiResponse<AdminUser>>(`/users/${selectedId}`, payload)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })

  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (!selectedId) throw new Error('No user selected')
      await adminClient.post(`/users/${selectedId}/verify-email`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setMobileDetailOpen(true)
  }

  const handleBack = () => {
    setMobileDetailOpen(false)
  }

  return (
    <AdminPageShell>
      {isLoading && !data ? (
        <Skeleton className="h-48 rounded-3xl" />
      ) : (
        <UsersPageHeader
          total={summary.total}
          admins={summary.admins}
          banned={summary.banned}
          loaded={summary.loaded}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
        <div
          className={cn(
            'lg:col-span-5',
            mobileDetailOpen ? 'hidden lg:block' : 'block',
          )}
        >
          <UserListPanel
            users={users}
            total={data?.total ?? 0}
            isLoading={isLoading}
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
            sort={sort}
            onSortChange={setSort}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>

        <div
          className={cn(
            'lg:col-span-7',
            mobileDetailOpen ? 'block' : 'hidden lg:block',
          )}
        >
          <UserDetailPanel
            user={selected}
            showBack
            onBack={handleBack}
            banReason={banReason}
            onBanReasonChange={setBanReason}
            balanceAdj={balanceAdj}
            onBalanceAdjChange={setBalanceAdj}
            isUpdating={updateMutation.isPending}
            isVerifying={verifyMutation.isPending}
            onPromoteToggle={() =>
              selected &&
              updateMutation.mutate({
                role: selected.role === 'ADMIN' ? 'USER' : 'ADMIN',
              })
            }
            onBanToggle={() =>
              selected &&
              updateMutation.mutate({
                isBanned: !selected.isBanned,
                banReason: selected.isBanned ? null : banReason || 'Suspended by admin',
              })
            }
            onVerifyEmail={() => verifyMutation.mutate()}
            onApplyBalance={() => {
              const n = Number(balanceAdj)
              if (!Number.isFinite(n) || n === 0) return
              updateMutation.mutate({
                balanceAdjustment: n,
                balanceReason: 'Admin adjustment',
              })
              setBalanceAdj('')
            }}
          />
        </div>
      </div>
    </AdminPageShell>
  )
}
