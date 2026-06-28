import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute, GuestRoute } from '@/app/guards'
import { AdminLayout } from '@/shared/layouts/AdminLayout'
import { AuthLayout } from '@/shared/layouts/AuthLayout'
import { Skeleton } from '@/shared/components/ui/Card'

const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const UsersPage = lazy(() =>
  import('@/features/users/UsersPage').then((m) => ({ default: m.UsersPage })),
)
const LeaguesPage = lazy(() =>
  import('@/features/leagues/LeaguesPage').then((m) => ({ default: m.LeaguesPage })),
)
const MarketsPage = lazy(() =>
  import('@/features/markets/MarketsPage').then((m) => ({ default: m.MarketsPage })),
)
const SeasonsPage = lazy(() =>
  import('@/features/seasons/SeasonsPage').then((m) => ({ default: m.SeasonsPage })),
)
const BetsPage = lazy(() =>
  import('@/features/bets/BetsPage').then((m) => ({ default: m.BetsPage })),
)
const ForumModerationPage = lazy(() =>
  import('@/features/forum/ForumModerationPage').then((m) => ({
    default: m.ForumModerationPage,
  })),
)
const AuditLogPage = lazy(() =>
  import('@/features/audit/AuditLogPage').then((m) => ({ default: m.AuditLogPage })),
)

function PageLoader() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
        </Route>
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="leagues" element={<LeaguesPage />} />
            <Route path="markets" element={<MarketsPage />} />
            <Route path="seasons" element={<SeasonsPage />} />
            <Route path="bets" element={<BetsPage />} />
            <Route path="forum" element={<ForumModerationPage />} />
            <Route path="audit" element={<AuditLogPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
