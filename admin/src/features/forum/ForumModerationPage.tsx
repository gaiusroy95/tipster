import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminClient } from '@/core/api/client'
import { queryKeys } from '@/core/constants/queryKeys'
import type { ApiResponse, Paginated } from '@/core/types/api'
import { Button } from '@/shared/components/ui/Button'
import { Card, Skeleton } from '@/shared/components/ui/Card'

interface ForumPost {
  id: string
  title: string
  status: string
  publishedAt: string
  author: { username: string; displayName: string }
}

export function ForumModerationPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.forum({}),
    queryFn: async () => {
      const res = await adminClient.get<ApiResponse<Paginated<ForumPost>>>('/posts', {
        params: { limit: 50 },
      })
      return res.data.data
    },
  })

  const hideMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await adminClient.patch(`/posts/${id}`, { status })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'forum'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminClient.delete(`/posts/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'forum'] }),
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Forum moderation</h1>
      <Card className="p-0 overflow-auto">
        {isLoading ? (
          <Skeleton className="h-48 m-4" />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-text-muted border-b border-border-default">
              <tr>
                <th className="p-3">Post</th>
                <th className="p-3">Author</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((post) => (
                <tr key={post.id} className="border-b border-border-default/50">
                  <td className="p-3">
                    <p className="font-medium">{post.title}</p>
                    <p className="text-xs text-text-muted">
                      {new Date(post.publishedAt).toLocaleString()}
                    </p>
                  </td>
                  <td className="p-3">{post.author.displayName}</td>
                  <td className="p-3">{post.status}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() =>
                          hideMutation.mutate({
                            id: post.id,
                            status: post.status === 'hidden' ? 'published' : 'hidden',
                          })
                        }
                      >
                        {post.status === 'hidden' ? 'Unhide' : 'Hide'}
                      </Button>
                      <Button variant="danger" onClick={() => deleteMutation.mutate(post.id)}>
                        Delete
                      </Button>
                    </div>
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
