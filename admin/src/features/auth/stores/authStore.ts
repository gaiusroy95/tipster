import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient, setAuthToken } from '@/core/api/client'
import type { AdminUser, ApiResponse } from '@/core/types/api'

const TOKEN_KEY = 'admin_auth_token'

interface AuthState {
  user: AdminUser | null
  token: string | null
  isInitialized: boolean
  setAuth: (user: AdminUser, token: string) => void
  logout: () => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isInitialized: false,

      setAuth: (user, token) => {
        setAuthToken(token)
        sessionStorage.setItem(TOKEN_KEY, token)
        set({ user, token })
      },

      logout: () => {
        setAuthToken(null)
        sessionStorage.removeItem(TOKEN_KEY)
        set({ user: null, token: null })
      },

      initialize: async () => {
        const token = get().token ?? sessionStorage.getItem(TOKEN_KEY)
        if (!token) {
          set({ isInitialized: true })
          return
        }
        setAuthToken(token)
        try {
          const { data } = await apiClient.get<ApiResponse<AdminUser>>('/auth/me')
          if (data.data.role !== 'ADMIN') {
            throw new Error('Not admin')
          }
          set({ user: data.data, token, isInitialized: true })
        } catch {
          setAuthToken(null)
          sessionStorage.removeItem(TOKEN_KEY)
          set({ user: null, token: null, isInitialized: true })
        }
      },
    }),
    {
      name: 'admin-auth-store',
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          sessionStorage.setItem(TOKEN_KEY, state.token)
          setAuthToken(state.token)
        }
      },
    },
  ),
)
