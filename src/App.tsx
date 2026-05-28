import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { WordListPage } from '@/pages/WordListPage'
import { WordDetailPage } from '@/pages/WordDetailPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'words', element: <WordListPage /> },
      { path: 'words/:wordId', element: <WordDetailPage /> },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
