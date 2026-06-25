import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AdminHeader } from '@/shared/layouts/AdminHeader'
import { AdminMain } from '@/shared/layouts/AdminMain'
import { AdminSidebar } from '@/shared/layouts/AdminSidebar'
import { ADMIN_ROUTE_LABELS } from '@/shared/layouts/adminNav'
import { useAuthStore } from '@/features/auth/stores/authStore'

export function AdminLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const pageTitle = ADMIN_ROUTE_LABELS[location.pathname] ?? 'Admin'
  const displayName = user?.displayName ?? 'Admin'

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const handleSignOut = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="admin-shell min-h-screen bg-bg-primary">
      <AdminHeader
        pageTitle={pageTitle}
        displayName={displayName}
        email={user?.email}
        onSignOut={handleSignOut}
        onOpenMobileNav={() => setMobileOpen(true)}
      />

      <AdminSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        displayName={displayName}
        email={user?.email}
        onSignOut={handleSignOut}
      />

      <div className="admin-shell-body min-h-screen lg:ml-[var(--admin-sidebar-width)] lg:pt-[var(--admin-header-height)]">
        <AdminMain />
      </div>
    </div>
  )
}
