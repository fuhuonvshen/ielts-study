import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Your learning overview' },
  '/words': { title: 'Word List', subtitle: 'Browse all IELTS vocabulary' },
  '/practice': { title: 'Practice', subtitle: 'Choose a practice mode' },
  '/wrong-book': { title: 'Wrong Book', subtitle: 'Words you missed' },
  '/favorites': { title: 'Favorites', subtitle: 'Your starred words' },
  '/stats': { title: 'Statistics', subtitle: 'Your learning progress' },
}

export function AppLayout() {
  const { pathname } = useLocation()
  const meta = pageTitles[pathname] ?? { title: 'IELTS Listen' }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="ml-56">
        <Header title={meta.title} subtitle={meta.subtitle} />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
