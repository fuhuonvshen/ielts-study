import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { WordListPage } from '@/pages/WordListPage'
import { WordDetailPage } from '@/pages/WordDetailPage'
import { PracticeHome } from '@/pages/PracticeHome'
import { ListenPick } from '@/pages/ListenPick'
import { MeaningPick } from '@/pages/MeaningPick'
import { SpellInput } from '@/pages/SpellInput'
import { ReversePick } from '@/pages/ReversePick'
import { Stats } from '@/pages/Stats'
import { WrongBook } from '@/pages/WrongBook'
import { Favorites } from '@/pages/Favorites'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'words', element: <WordListPage /> },
      { path: 'words/:wordId', element: <WordDetailPage /> },
      { path: 'practice', element: <PracticeHome /> },
      { path: 'practice/listen', element: <ListenPick /> },
      { path: 'practice/meaning', element: <MeaningPick /> },
      { path: 'practice/spell', element: <SpellInput /> },
      { path: 'practice/reverse', element: <ReversePick /> },
      { path: 'stats', element: <Stats /> },
      { path: 'wrong-book', element: <WrongBook /> },
      { path: 'favorites', element: <Favorites /> },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
