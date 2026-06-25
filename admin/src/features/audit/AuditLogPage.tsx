import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminClient } from '@/core/api/client'
import { queryKeys } from '@/core/constants/queryKeys'
import type { ApiResponse, Paginated } from '@/core/types/api'
import { AuditDossierPanel } from '@/features/audit/components/AuditDossierPanel'
import { AuditFilterRail } from '@/features/audit/components/AuditFilterRail'
import { AuditTimelineStream } from '@/features/audit/components/AuditTimelineStream'
import { AuditVaultHero } from '@/features/audit/components/AuditVaultHero'
import {
  filterAuditEntries,
  summarizeAuditEntries,
  type AdminAuditEntry,
  type AuditEntityFilter,
} from '@/features/audit/lib/auditUtils'
import { Skeleton } from '@/shared/components/ui/Card'
import { AdminPageShell } from '@/shared/components/AdminPageShell'

const PAGE_SIZE = 30

export function AuditLogPage() {
  const dossierRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [entityType, setEntityType] = useState<AuditEntityFilter>('all')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [accumulated, setAccumulated] = useState<AdminAuditEntry[]>([])

  const queryParams = {
    entityType: entityType === 'all' ? undefined : entityType,
    limit: PAGE_SIZE,
    page,
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: queryKeys.audit(queryParams),
    queryFn: async () => {
      const res = await adminClient.get<ApiResponse<Paginated<AdminAuditEntry>>>('/audit-logs', {
        params: queryParams,
      })
      return res.data.data
    },
  })

  useEffect(() => {
    if (!data) return
    setAccumulated((prev) => {
      if (page === 1) return data.items
      const ids = new Set(prev.map((e) => e.id))
      const next = data.items.filter((e) => !ids.has(e.id))
      return [...prev, ...next]
    })
  }, [data, page])

  useEffect(() => {
    setPage(1)
    setAccumulated([])
    setSelectedId(null)
  }, [entityType])

  const visibleEntries = useMemo(
    () => filterAuditEntries(accumulated, search),
    [accumulated, search],
  )

  useEffect(() => {
    if (!selectedId) return
    const stillVisible = visibleEntries.some((e) => e.id === selectedId)
    if (!stillVisible && visibleEntries.length > 0) {
      setSelectedId(visibleEntries[0]?.id ?? null)
    }
  }, [visibleEntries, selectedId])

  const total = data?.total ?? 0
  const summary = useMemo(
    () => summarizeAuditEntries(visibleEntries, search ? visibleEntries.length : total),
    [visibleEntries, search, total],
  )
  const selectedEntry = visibleEntries.find((e) => e.id === selectedId) ?? null
  const hasMore = accumulated.length < total

  const handleSelect = (entry: AdminAuditEntry) => {
    setSelectedId(entry.id)
    if (window.matchMedia('(max-width: 1023px)').matches) {
      requestAnimationFrame(() => {
        dossierRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

  return (
    <AdminPageShell compact>
      {isLoading && !data ? (
        <Skeleton className="h-64 rounded-[1.75rem]" />
      ) : (
        <AuditVaultHero
          total={summary.total}
          loaded={summary.loaded}
          recent24h={summary.recent24h}
          admins={summary.admins}
          critical={summary.critical}
        />
      )}

      <AuditFilterRail
        search={search}
        onSearchChange={setSearch}
        entityType={entityType}
        onEntityTypeChange={setEntityType}
        total={total}
        visible={visibleEntries.length}
      />

      <div className="grid gap-5 lg:grid-cols-12 lg:gap-6 xl:gap-8">
        <div className="lg:col-span-5 xl:col-span-5">
          <AuditTimelineStream
            entries={visibleEntries}
            selectedId={selectedId}
            onSelect={handleSelect}
            isLoading={isLoading}
            hasMore={hasMore && !search}
            onLoadMore={() => setPage((p) => p + 1)}
            isLoadingMore={isFetching && page > 1}
          />
        </div>

        <div ref={dossierRef} className="lg:col-span-7 xl:col-span-7">
          <AuditDossierPanel entry={selectedEntry} />
        </div>
      </div>
    </AdminPageShell>
  )
}
