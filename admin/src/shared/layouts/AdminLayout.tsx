import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AdminShellGate } from '@/app/AdminShellGate'
import { AdminMain } from '@/shared/layouts/AdminMain'
import { AdminMobileBar } from '@/shared/layouts/AdminMobileBar'
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
    <AdminShellGate>
    <div className="admin-shell min-h-screen bg-bg-primary">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        displayName={displayName}
        email={user?.email}
        onSignOut={handleSignOut}
      />

      <div className="admin-shell-body flex min-h-screen flex-col lg:pb-[var(--admin-sidebar-inset)] lg:pl-[var(--admin-sidebar-rail)] lg:pr-[var(--admin-sidebar-inset)] lg:pt-[var(--admin-sidebar-inset)]">
        <AdminMobileBar pageTitle={pageTitle} onOpenMobileNav={() => setMobileOpen(true)} />
        <AdminMain />
      </div>
    </div>
    </AdminShellGate>
  )
}
