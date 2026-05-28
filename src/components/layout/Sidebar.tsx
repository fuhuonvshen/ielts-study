import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BookOpen,
  Play,
  AlertTriangle,
  Star,
  BarChart3,
} from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/words', icon: BookOpen, label: 'Words' },
  { to: '/practice', icon: Play, label: 'Practice' },
  { to: '/wrong-book', icon: AlertTriangle, label: 'Wrong Book' },
  { to: '/favorites', icon: Star, label: 'Favorites' },
  { to: '/stats', icon: BarChart3, label: 'Statistics' },
]

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r border-gray-100 bg-white/70 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-500">
          <span className="text-sm font-bold text-white">IL</span>
        </div>
        <span className="text-lg font-semibold tracking-tight">IELTS Listen</span>
      </div>
      <nav className="mt-4 space-y-0.5 px-3">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
