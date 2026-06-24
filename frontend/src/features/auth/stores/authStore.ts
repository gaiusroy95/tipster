import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/mocks/data/types'
import { setAuthToken } from '@/core/api/client'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'

const TOKEN_KEY = 'tipster_auth_token'

interface AuthState {
  user: User | null
  token: string | null
  isInitialized: boolean
  setAuth: (user: User, token: string) => void
  setUser: (user: User) => void
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

      setUser: (user) => set({ user }),

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
          const { data } = await apiClient.get<ApiResponse<User>>('/auth/me')
          set({ user: data.data, token, isInitialized: true })
        } catch {
          setAuthToken(null)
          set({ user: null, token: null, isInitialized: true })
        }
      },
    }),
    {
      name: 'auth-store',
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
