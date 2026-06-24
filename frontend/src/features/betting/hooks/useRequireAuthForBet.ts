import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useToast } from '@/shared/components/ui/Toast'
import { ROUTES } from '@/core/constants/routes'

export function useRequireAuthForBet() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  return useCallback((): boolean => {
    if (user) return true
    toast('Sign in to place bets', 'error')
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`)
    navigate(`${ROUTES.LOGIN}?redirect=${redirect}`)
    return false
  }, [user, navigate, location.pathname, location.search, toast])
}
