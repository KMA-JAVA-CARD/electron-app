import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'

export const MainLayout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        <Outlet />
      </main>
    </div>
  )
}
