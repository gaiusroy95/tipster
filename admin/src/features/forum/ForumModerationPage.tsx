import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminClient } from '@/core/api/client'
import { queryKeys } from '@/core/constants/queryKeys'
import type { ApiResponse, Paginated } from '@/core/types/api'
import { ForumMosaicGrid } from '@/features/forum/components/ForumMosaicGrid'
import { ForumPulseHero } from '@/features/forum/components/ForumPulseHero'
import { ForumSignalBar } from '@/features/forum/components/ForumSignalBar'
import { ForumSpotlightPanel } from '@/features/forum/components/ForumSpotlightPanel'
import {
  summarizeForumPosts,
  type AdminForumPost,
  type ForumStatusFilter,
} from '@/features/forum/lib/forumUtils'
import { Skeleton } from '@/shared/components/ui/Card'
import { AdminPageShell } from '@/shared/components/AdminPageShell'

const PAGE_SIZE = 20

export function ForumModerationPage() {
  const queryClient = useQueryClient()
  const spotlightRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ForumStatusFilter>('all')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [accumulated, setAccumulated] = useState<AdminForumPost[]>([])

  const queryParams = {
    status: status === 'all' ? undefined : status,
    search: search || undefined,
    limit: PAGE_SIZE,
    page,
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: queryKeys.forum(queryParams),
    queryFn: async () => {
      const res = await adminClient.get<ApiResponse<Paginated<AdminForumPost>>>('/posts', {
        params: queryParams,
      })
      return res.data.data
    },
  })

  useEffect(() => {
    if (!data) return
    setAccumulated((prev) => {
      if (page === 1) return data.items
      const ids = new Set(prev.map((p) => p.id))
      const next = data.items.filter((p) => !ids.has(p.id))
      return [...prev, ...next]
    })
  }, [data, page])

  useEffect(() => {
    setPage(1)
    setAccumulated([])
    setSelectedId(null)
  }, [status, search])

  useEffect(() => {
    if (!selectedId) return
    const stillVisible = accumulated.some((p) => p.id === selectedId)
    if (!stillVisible && accumulated.length > 0) {
      setSelectedId(accumulated[0]?.id ?? null)
    }
  }, [accumulated, selectedId])

  const hideMutation = useMutation({
    mutationFn: async ({ id, status: nextStatus }: { id: string; status: string }) => {
      await adminClient.patch(`/posts/${id}`, { status: nextStatus })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'forum'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminClient.delete(`/posts/${id}`)
    },
    onSuccess: (_, deletedId) => {
      setSelectedId((current) => (current === deletedId ? null : current))
      queryClient.invalidateQueries({ queryKey: ['admin', 'forum'] })
    },
  })

  const posts = accumulated
  const total = data?.total ?? 0
  const summary = useMemo(() => summarizeForumPosts(posts, total), [posts, total])
  const selectedPost = posts.find((p) => p.id === selectedId) ?? null
  const hasMore = posts.length < total

  const handleSelect = (post: AdminForumPost) => {
    setSelectedId(post.id)
    if (window.matchMedia('(max-width: 1023px)').matches) {
      requestAnimationFrame(() => {
        spotlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

  const handleHideToggle = (post: AdminForumPost) => {
    hideMutation.mutate({
      id: post.id,
      status: post.status === 'hidden' ? 'published' : 'hidden',
    })
  }

  return (
    <AdminPageShell compact>
      {isLoading && !data ? (
        <Skeleton className="h-64 rounded-[1.75rem]" />
      ) : (
        <ForumPulseHero
          total={summary.total}
          loaded={summary.loaded}
          views={summary.views}
          comments={summary.comments}
          authors={summary.authors}
          hidden={summary.hidden}
        />
      )}

      <ForumSignalBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        total={total}
      />

      <div className="grid gap-5 lg:grid-cols-12 lg:gap-6 xl:gap-8">
        <div className="lg:col-span-5 xl:col-span-4">
          <ForumMosaicGrid
            posts={posts}
            selectedId={selectedId}
            onSelect={handleSelect}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={() => setPage((p) => p + 1)}
            isLoadingMore={isFetching && page > 1}
          />
        </div>

        <div ref={spotlightRef} className="lg:col-span-7 xl:col-span-8">
          <ForumSpotlightPanel
            post={selectedPost}
            onHideToggle={handleHideToggle}
            onDelete={(post) => deleteMutation.mutate(post.id)}
            isUpdating={hideMutation.isPending}
            isDeleting={deleteMutation.isPending}
          />
        </div>
      </div>
    </AdminPageShell>
  )
}
