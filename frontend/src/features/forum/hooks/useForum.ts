import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import { queryKeys } from '@/core/constants/queryKeys'
import type {
  CreateForumPostPayload,
  ForumCategory,
  ForumComment,
  ForumPostDetail,
  ForumPostListResponse,
  ForumPostSummary,
  PopularTag,
} from '@/features/forum/types/forum'

export function useForumCategories() {
  return useQuery({
    queryKey: queryKeys.forum.categories(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ForumCategory[]>>('/forum/categories')
      return res.data.data
    },
  })
}

export function useForumTags() {
  return useQuery({
    queryKey: queryKeys.forum.tags(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PopularTag[]>>('/forum/tags')
      return res.data.data
    },
  })
}

export function useForumPosts(filters?: { limit?: number; offset?: number; category?: string; tag?: string }) {
  const limit = filters?.limit ?? 20
  const offset = filters?.offset ?? 0
  return useQuery({
    queryKey: queryKeys.forum.list(limit, offset, filters?.category, filters?.tag),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ForumPostListResponse>>('/forum/posts', {
        params: { limit, offset, category: filters?.category, tag: filters?.tag },
      })
      return res.data.data
    },
  })
}

export function useMyForumDrafts(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.forum.drafts(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ForumPostSummary[]>>('/forum/posts/me/drafts')
      return res.data.data
    },
    enabled,
  })
}

export function useMyForumScheduled(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.forum.scheduled(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ForumPostSummary[]>>('/forum/posts/me/scheduled')
      return res.data.data
    },
    enabled,
  })
}

export function useForumPost(slug: string) {
  return useQuery({
    queryKey: queryKeys.forum.detail(slug),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ForumPostDetail>>(`/forum/posts/${slug}`)
      return res.data.data
    },
    enabled: !!slug,
  })
}

export function useForumComments(postId: string) {
  return useQuery({
    queryKey: queryKeys.forum.comments(postId),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ForumComment[]>>(`/forum/posts/${postId}/comments`)
      return res.data.data
    },
    enabled: !!postId,
  })
}

export function useCreateForumPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateForumPostPayload) => {
      const res = await apiClient.post<ApiResponse<ForumPostDetail>>('/forum/posts', data)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
    },
  })
}

export function useUpdateForumPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateForumPostPayload> }) => {
      const res = await apiClient.patch<ApiResponse<ForumPostDetail>>(`/forum/posts/${id}`, data)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.all() })
    },
  })
}

export function usePublishForumPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post<ApiResponse<ForumPostDetail>>(`/forum/posts/${id}/publish`)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
    },
  })
}

export function useDeleteForumPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete<ApiResponse<{ message: string }>>(`/forum/posts/${id}`)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.all() })
    },
  })
}

export function useRecordForumView() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (postId: string) => {
      const res = await apiClient.post<ApiResponse<{ recorded: boolean; viewCount: number }>>(
        `/forum/posts/${postId}/view`,
      )
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() })
    },
  })
}

export function useCreateForumComment(postId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { body: string; parentId?: string }) => {
      const res = await apiClient.post<ApiResponse<ForumComment>>(`/forum/posts/${postId}/comments`, data)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.comments(postId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.all() })
    },
  })
}

export function useVoteForumPoll(postId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (optionId: string) => {
      const res = await apiClient.post<ApiResponse<ForumPostDetail>>(`/forum/posts/${postId}/poll/vote`, {
        optionId,
      })
      return res.data.data
    },
    onSuccess: (post) => {
      queryClient.setQueryData(queryKeys.forum.detail(post.slug), post)
    },
  })
}

export type { ForumPostSummary, ForumPostDetail }
