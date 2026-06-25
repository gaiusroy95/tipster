import { Outlet } from 'react-router-dom'

export function AdminMain() {
  return (
    <main className="admin-main relative flex-1 overflow-auto safe-area-pb">
      <div className="pointer-events-none absolute inset-0 admin-shell-backdrop" aria-hidden="true" />
      <div className="admin-main-content relative w-full px-4 pt-4 pb-4 lg:px-0 lg:pt-0 lg:pb-0">
        <Outlet />
      </div>
    </main>
  )
}
