import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ROUTES, playerPath } from '@/core/constants/routes'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useEditProfileDrawer } from '@/features/profile/context/EditProfileDrawerContext'

/** Opens the edit profile drawer and redirects to the user's profile page. */
export function ProfileEditPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const { open } = useEditProfileDrawer()

  useEffect(() => {
    open()
  }, [open])

  useEffect(() => {
    if (user) {
      navigate(playerPath(user.id), { replace: true })
    }
  }, [user, navigate])

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <></>
}
