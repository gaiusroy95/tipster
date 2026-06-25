import { Outlet } from 'react-router-dom'

export function AdminMain() {
  return (
    <main className="admin-main relative flex-1 overflow-auto safe-area-pb">
      <div className="pointer-events-none absolute inset-0 admin-shell-backdrop" aria-hidden="true" />
      <div className="admin-main-content relative p-4 sm:p-6 lg:p-8">
        <Outlet />
      </div>
    </main>
  )
}
