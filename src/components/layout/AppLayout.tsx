import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Your learning overview' },
  '/words': { title: 'Word List', subtitle: 'Browse all IELTS vocabulary' },
  '/practice': { title: 'Practice', subtitle: 'Choose a practice mode' },
  '/wrong-book': { title: 'Wrong Book', subtitle: 'Words you missed' },
  '/favorites': { title: 'Favorites', subtitle: 'Your starred words' },
  '/daily-practice': { title: 'Daily Practice', subtitle: 'Real-world English listening practice' },
  '/archive': { title: 'Archive', subtitle: 'Every past daily practice, one day at a time' },
  '/stats': { title: 'Statistics', subtitle: 'Your learning progress' },
  '/feedback': { title: 'Feedback', subtitle: 'Tell me what to build next' },
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
