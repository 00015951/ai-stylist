import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  MessageSquare,
  Palette,
  LogOut,
  Sparkles,
} from 'lucide-react'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Foydalanuvchilar' },
  { to: '/subscriptions', icon: CreditCard, label: 'Pro obunalar' },
  { to: '/ai-requests', icon: MessageSquare, label: "AI so'rovlar" },
  { to: '/styles', icon: Palette, label: 'Uslublar' },
]

export default function Layout() {
  const navigate = useNavigate()
  const logout = () => {
    localStorage.removeItem('admin_token')
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <aside className="flex w-64 flex-col border-r border-slate-700/50 bg-slate-900/95 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-700/50 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
            <Sparkles className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <span className="font-semibold text-white">Super Admin</span>
            <p className="text-xs text-slate-500">Virtual AI Stylist</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-700/50 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
            Chiqish
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}
