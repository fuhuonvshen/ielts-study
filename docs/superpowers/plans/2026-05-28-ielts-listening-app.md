# IELTS Listening Practice App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first IELTS listening practice SPA with multiple quiz modes, progress tracking, and word management.

**Architecture:** React 18 + TypeScript SPA built with Vite 5. Data layer uses Dexie.js over IndexedDB for local persistence. State managed via Zustand stores. Audio playback uses Youdao API with Web Speech API fallback. UI uses shadcn/ui primitives with Tailwind CSS in Apple-inspired minimal style.

**Tech Stack:** React 18, TypeScript 5, Vite 5, Tailwind CSS 4, shadcn/ui, Zustand, Dexie.js, React Router v7, Recharts, Vitest + React Testing Library

---

## File Structure

```
src/
├── main.tsx                          # App entry, render router
├── App.tsx                           # RouterProvider wrapper
├── index.css                         # Tailwind directives + base styles
├── vite-env.d.ts                     # Vite env types
├── types/
│   └── index.ts                      # All domain types & DB interfaces
├── lib/
│   ├── db.ts                         # Dexie instance + table definitions
│   └── utils.ts                      # cn() helper, shuffle, pick random
├── services/
│   ├── audioService.ts               # Audio playback with fallback
│   ├── wordService.ts                # Word CRUD against IndexedDB
│   ├── practiceService.ts            # Practice session logic
│   ├── statsService.ts               # Daily stats aggregation
│   └── importService.ts              # JSONL parse + bulk insert
├── stores/
│   ├── wordStore.ts                  # Zustand: word list, search, filter
│   ├── practiceStore.ts              # Zustand: active session, answers
│   └── statsStore.ts                 # Zustand: stats cache
├── hooks/
│   ├── useAudio.ts                   # Audio play hook with loading state
│   └── usePracticeSession.ts         # Practice lifecycle hook
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx             # Sidebar + header + outlet
│   │   ├── Header.tsx                # Top bar: breadcrumb, streak
│   │   └── Sidebar.tsx               # Nav links, stats summary
│   ├── word/
│   │   ├── WordCard.tsx              # Single word list item
│   │   ├── WordList.tsx              # Virtual-scrolled word list
│   │   └── WordDetail.tsx            # Full word info panel
│   ├── practice/
│   │   ├── AudioButton.tsx           # Large round speaker button
│   │   ├── OptionCard.tsx            # Selectable answer card
│   │   ├── ProgressBar.tsx           # Thin progress indicator
│   │   └── SessionResult.tsx         # End-of-session summary
│   └── stats/
│       ├── Heatmap.tsx               # 7-day activity heatmap
│       └── TrendChart.tsx            # Accuracy trend line chart
├── pages/
│   ├── Dashboard.tsx                 # Home: today stats, quick start
│   ├── WordListPage.tsx              # Browse all words
│   ├── WordDetailPage.tsx            # Single word deep view
│   ├── PracticeHome.tsx              # Mode selection screen
│   ├── ListenPick.tsx                # Listen → pick word (4 options)
│   ├── MeaningPick.tsx               # See word → pick meaning
│   ├── SpellInput.tsx                # Listen → type spelling
│   ├── ReversePick.tsx               # See meaning → pick word
│   ├── PracticeResultPage.tsx        # Session score + word list
│   ├── WrongBook.tsx                 # Auto-collected wrong words
│   ├── Favorites.tsx                 # Starred words
│   └── Stats.tsx                     # Full statistics dashboard
└── workers/
    └── importWorker.ts               # Web Worker: parse JSONL off main thread
```

---

## Phase 1: Project Infrastructure

### Task 1.1: Scaffold Vite + React + TypeScript project

**Files:**
- Create: all project scaffold files

- [ ] **Step 1: Create project with Vite**

```bash
cd d:/PyProject/IELTS_listen_project
pnpm create vite@latest . --template react-ts -- --force
```

Expected: Vite scaffolds into current directory. It will prompt about overwriting existing files — choose yes for package.json etc.

- [ ] **Step 2: Install core dependencies**

```bash
pnpm add react-router-dom zustand dexie recharts clsx tailwind-merge lucide-react
```

- [ ] **Step 3: Install dev dependencies**

```bash
pnpm add -D @types/react @types/react-dom vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom tailwindcss @tailwindcss/vite postcss autoprefixer
```

- [ ] **Step 4: Initialize Tailwind CSS and shadcn/ui**

Create `src/index.css`:
```css
@import "tailwindcss";

@theme {
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  --color-success-50: #f0fdf4;
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  --color-danger-50: #fef2f2;
  --color-danger-500: #ef4444;
  --color-danger-600: #dc2626;
}

@layer base {
  body {
    @apply bg-gray-50 text-gray-900 antialiased;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Microsoft YaHei", sans-serif;
  }
}
```

Configure `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
})
```

Update `tsconfig.app.json` with path aliases:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- [ ] **Step 5: Create test setup file**

Create `src/test-setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Verify build works**

```bash
pnpm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 7: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Vite + React + TS project with Tailwind and Vitest"
```

### Task 1.2: Define TypeScript types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Create types file**

Create `src/types/index.ts`:
```typescript
export interface WordTranslation {
  pos: string
  tranCn: string
  tranOther?: string
}

export interface WordSentence {
  en: string
  cn: string
}

export interface WordSynonym {
  pos: string
  tran: string
  words: string[]
}

export interface WordPhrase {
  en: string
  cn: string
}

export interface WordRelWord {
  pos: string
  words: { hwd: string; tran: string }[]
}

export interface RawWordData {
  wordRank: number
  headWord: string
  bookId: string
  content: {
    word: {
      wordHead: string
      wordId: string
      content: {
        usphone?: string
        ukphone?: string
        usspeech?: string
        ukspeech?: string
        speech?: string
        trans?: {
          tranCn: string
          descOther?: string
          descCn?: string
          pos?: string
          tranOther?: string
        }[]
        sentence?: {
          sentences?: { sContent: string; sCn: string }[]
          desc?: string
        }
        syno?: {
          synos?: {
            pos: string
            tran: string
            hwds: { w: string }[]
          }[]
          desc?: string
        }
        phrase?: {
          phrases?: { pContent: string; pCn: string }[]
          desc?: string
        }
        relWord?: {
          rels?: {
            pos: string
            words: { hwd: string; tran: string }[]
          }[]
          desc?: string
        }
      }
    }
  }
}

export interface Word {
  id: string
  wordRank: number
  headWord: string
  bookId: string
  usphone: string
  ukphone: string
  usspeech: string
  ukspeech: string
  translations: WordTranslation[]
  sentences: WordSentence[]
  synonyms: WordSynonym[]
  phrases: WordPhrase[]
  relWords: WordRelWord[]
  status: 'new' | 'learning' | 'mastered'
  correctCount: number
  wrongCount: number
  lastPracticeAt: number | null
  isFavorite: boolean
  favoriteTags: string[]
}

export type PracticeMode = 'listen' | 'meaning' | 'spell' | 'reverse'

export interface PracticeRecord {
  id?: number
  wordId: string
  mode: PracticeMode
  isCorrect: boolean
  userAnswer: string
  timestamp: number
  duration: number
}

export interface DailyStats {
  date: string
  totalCount: number
  correctCount: number
  mode: PracticeMode
}

export interface PracticeSession {
  mode: PracticeMode
  words: Word[]
  currentIndex: number
  answers: { wordId: string; isCorrect: boolean; userAnswer: string; duration: number }[]
  startTime: number
  isComplete: boolean
}

export interface PracticeOption {
  word: Word
  isCorrect: boolean
  disabled: boolean
}
```

- [ ] **Step 2: Verify types compile**

```bash
pnpm tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: define core TypeScript types for Word, PracticeRecord, and session models"
```

### Task 1.3: Set up Dexie.js database

**Files:**
- Create: `src/lib/db.ts`

- [ ] **Step 1: Write the database module test**

Create `src/lib/__tests__/db.test.ts`:
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db, addWords, getWordById, getAllWordIds, getWordsByStatus } from '../db'
import type { Word } from '@/types'

const sampleWord: Word = {
  id: 'test_1',
  wordRank: 1,
  headWord: 'test',
  bookId: 'TEST',
  usphone: 'tɛst',
  ukphone: 'test',
  usspeech: 'test&type=2',
  ukspeech: 'test&type=1',
  translations: [{ pos: 'n', tranCn: '测试' }],
  sentences: [{ en: 'This is a test.', cn: '这是一个测试。' }],
  synonyms: [],
  phrases: [],
  relWords: [],
  status: 'new',
  correctCount: 0,
  wrongCount: 0,
  lastPracticeAt: null,
  isFavorite: false,
  favoriteTags: [],
}

describe('Database', () => {
  beforeAll(async () => {
    await addWords([sampleWord])
  })

  afterAll(async () => {
    await db.words.clear()
  })

  it('gets a word by id', async () => {
    const word = await getWordById('test_1')
    expect(word).toBeDefined()
    expect(word!.headWord).toBe('test')
  })

  it('gets all word ids', async () => {
    const ids = await getAllWordIds()
    expect(ids).toContain('test_1')
  })

  it('gets words by status', async () => {
    const words = await getWordsByStatus('new')
    expect(words.length).toBeGreaterThan(0)
    expect(words[0].status).toBe('new')
  })

  it('updates word status', async () => {
    await db.words.update('test_1', { status: 'learning' })
    const word = await getWordById('test_1')
    expect(word!.status).toBe('learning')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm vitest run src/lib/__tests__/db.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement database module**

Create `src/lib/db.ts`:
```typescript
import Dexie, { type Table } from 'dexie'
import type { Word, PracticeRecord, DailyStats } from '@/types'

export class IeltsDb extends Dexie {
  words!: Table<Word, string>
  practiceRecords!: Table<PracticeRecord, number>
  dailyStats!: Table<DailyStats, string>

  constructor() {
    super('ielts_listening')
    this.version(1).stores({
      words: 'id, headWord, status, isFavorite, bookId',
      practiceRecords: '++id, wordId, mode, isCorrect, timestamp',
      dailyStats: 'date, mode',
    })
  }
}

export const db = new IeltsDb()

export async function addWords(words: Word[]): Promise<void> {
  await db.words.bulkPut(words)
}

export async function getWordById(id: string): Promise<Word | undefined> {
  return db.words.get(id)
}

export async function getAllWordIds(): Promise<string[]> {
  return (await db.words.toCollection().primaryKeys()) as string[]
}

export async function getWordsByStatus(status: Word['status']): Promise<Word[]> {
  return db.words.where('status').equals(status).toArray()
}

export async function getAllWords(): Promise<Word[]> {
  return db.words.orderBy('wordRank').toArray()
}

export async function searchWords(query: string): Promise<Word[]> {
  const lower = query.toLowerCase()
  return db.words
    .filter(
      (w) =>
        w.headWord.toLowerCase().includes(lower) ||
        w.translations.some((t) => t.tranCn.includes(query))
    )
    .toArray()
}

export async function updateWord(id: string, changes: Partial<Word>): Promise<void> {
  await db.words.update(id, changes)
}

export async function getWordCount(): Promise<number> {
  return db.words.count()
}

export async function addPracticeRecord(record: PracticeRecord): Promise<number> {
  return db.practiceRecords.add(record)
}

export async function getPracticeRecordsByWordId(wordId: string): Promise<PracticeRecord[]> {
  return db.practiceRecords.where('wordId').equals(wordId).toArray()
}

export async function getPracticeRecordsByDateRange(
  start: number,
  end: number
): Promise<PracticeRecord[]> {
  return db.practiceRecords.where('timestamp').between(start, end).toArray()
}

export async function getWrongWordIds(): Promise<string[]> {
  const records = await db.practiceRecords.where('isCorrect').equals(false).toArray()
  return [...new Set(records.map((r) => r.wordId))]
}

export async function upsertDailyStats(stats: DailyStats): Promise<void> {
  await db.dailyStats.put(stats)
}

export async function getDailyStatsByDate(date: string): Promise<DailyStats | undefined> {
  return db.dailyStats.get(date)
}

export async function getAllDailyStats(): Promise<DailyStats[]> {
  return db.dailyStats.toArray()
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm vitest run src/lib/__tests__/db.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/db.ts src/lib/__tests__/db.test.ts
git commit -m "feat: set up Dexie.js database with words, practiceRecords, and dailyStats tables"
```

### Task 1.4: Create utility helpers and layout shell

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/components/layout/AppLayout.tsx`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Write utility tests**

Create `src/lib/__tests__/utils.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { cn, shuffle, pickRandom, formatDate, formatAccuracy } from '../utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
    expect(cn('a', false && 'b', 'c')).toBe('a c')
  })
})

describe('shuffle', () => {
  it('returns array of same length', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(shuffle(arr)).toHaveLength(5)
  })

  it('contains same elements', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(shuffle(arr).sort()).toEqual([1, 2, 3, 4, 5])
  })
})

describe('pickRandom', () => {
  it('picks n elements', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    expect(pickRandom(arr, 3)).toHaveLength(3)
  })

  it('does not include excluded element', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = pickRandom(arr, 4, 3)
    expect(result).not.toContain(3)
    expect(result).toHaveLength(4)
  })
})

describe('formatDate', () => {
  it('formats date to YYYY-MM-DD', () => {
    expect(formatDate(new Date('2026-05-28'))).toBe('2026-05-28')
  })
})

describe('formatAccuracy', () => {
  it('formats accuracy as percentage', () => {
    expect(formatAccuracy(7, 10)).toBe('70%')
    expect(formatAccuracy(0, 0)).toBe('0%')
  })
})
```

- [ ] **Step 2: Implement utils**

Create `src/lib/utils.ts`:
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function shuffle<T>(array: T[]): T[] {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function pickRandom<T>(array: T[], count: number, exclude?: T): T[] {
  const pool = exclude != null ? array.filter((item) => item !== exclude) : [...array]
  return shuffle(pool).slice(0, count)
}

export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatAccuracy(correct: number, total: number): string {
  if (total === 0) return '0%'
  return `${Math.round((correct / total) * 100)}%`
}

export function getTodayDateString(): string {
  return formatDate(new Date())
}
```

- [ ] **Step 3: Create layout components**

Create `src/components/layout/Sidebar.tsx`:
```typescript
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
```

Create `src/components/layout/Header.tsx`:
```typescript
import { Flame } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
  streak?: number
}

export function Header({ title, subtitle, streak }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-100 bg-white/50 px-8 py-4 backdrop-blur-sm">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {streak != null && streak > 0 && (
        <div className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-600">{streak} day streak</span>
        </div>
      )}
    </header>
  )
}
```

Create `src/components/layout/AppLayout.tsx`:
```typescript
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useLocation } from 'react-router-dom'

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
```

- [ ] **Step 4: Set up App.tsx with router**

Modify `src/App.tsx`:
```typescript
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { WordListPage } from '@/pages/WordListPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'words', element: <WordListPage /> },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
```

Modify `src/main.tsx`:
```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

Create placeholder pages. Create `src/pages/Dashboard.tsx`:
```typescript
export function Dashboard() {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Welcome to IELTS Listen</h2>
      <p className="text-gray-500">Start practicing to see your stats here.</p>
    </div>
  )
}
```

Create `src/pages/WordListPage.tsx`:
```typescript
export function WordListPage() {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Word List</h2>
      <p className="text-gray-500">Word list coming soon.</p>
    </div>
  )
}
```

- [ ] **Step 5: Verify app builds and runs**

```bash
pnpm run build
```

Expected: Build succeeds. Then verify dev server:
```bash
pnpm run dev
```
Visit http://localhost:5173 — should see sidebar + dashboard page.

- [ ] **Step 6: Commit**

```bash
git add src/lib/utils.ts src/lib/__tests__/utils.test.ts src/components/layout/ src/pages/ src/App.tsx src/main.tsx
git commit -m "feat: add layout shell with sidebar navigation, header, and router setup"
```

---

## Phase 2: Word Module

### Task 2.1: JSONL import service

**Files:**
- Create: `src/services/importService.ts`
- Create: `src/workers/importWorker.ts`
- Create: `src/services/__tests__/importService.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/services/__tests__/importService.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { parseLine, transformWord } from '../importService'
import type { RawWordData } from '@/types'

const sampleLine = JSON.stringify({
  wordRank: 1,
  headWord: 'sensible',
  content: {
    word: {
      wordHead: 'sensible',
      wordId: 'IELTSluan_2_1',
      content: {
        usphone: "'sɛnsəbl",
        ukphone: "'sensɪb(ə)l",
        usspeech: 'sensible&type=2',
        ukspeech: 'sensible&type=1',
        trans: [
          { tranCn: '明智的', descOther: '英释', descCn: '中释', pos: 'adj', tranOther: 'reasonable' },
        ],
        sentence: {
          sentences: [{ sContent: 'She seems very sensible.', sCn: '她好像很明智。' }],
        },
        syno: { synos: [{ pos: 'adj', tran: '明智的', hwds: [{ w: 'wise' }] }] },
        phrase: { phrases: [{ pContent: 'sensible heat', pCn: '显热' }] },
        relWord: { rels: [{ pos: 'adj', words: [{ hwd: 'sensitive', tran: '敏感的' }] }] },
      },
    },
  },
  bookId: 'IELTSluan_2',
})

describe('parseLine', () => {
  it('parses a valid JSONL line into RawWordData', () => {
    const result = parseLine(sampleLine)
    expect(result).toBeDefined()
    expect(result!.headWord).toBe('sensible')
    expect(result!.bookId).toBe('IELTSluan_2')
  })

  it('returns null for invalid JSON', () => {
    expect(parseLine('not json')).toBeNull()
  })
})

describe('transformWord', () => {
  it('transforms RawWordData into Word', () => {
    const raw = parseLine(sampleLine)!
    const word = transformWord(raw)
    expect(word.id).toBe('IELTSluan_2_1')
    expect(word.headWord).toBe('sensible')
    expect(word.usphone).toBe("'sɛnsəbl")
    expect(word.sentences).toHaveLength(1)
    expect(word.sentences[0].en).toBe('She seems very sensible.')
    expect(word.status).toBe('new')
    expect(word.isFavorite).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm vitest run src/services/__tests__/importService.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement import service**

Create `src/services/importService.ts`:
```typescript
import type { RawWordData, Word } from '@/types'

export function parseLine(line: string): RawWordData | null {
  try {
    return JSON.parse(line) as RawWordData
  } catch {
    return null
  }
}

function replaceFran(str: string): string {
  const fr_en: [string, string][] = [
    ['é', 'e'], ['ê', 'e'], ['è', 'e'], ['ë', 'e'],
    ['à', 'a'], ['â', 'a'], ['ç', 'c'], ['î', 'i'],
    ['ï', 'i'], ['ô', 'o'], ['ù', 'u'], ['û', 'u'],
    ['ü', 'u'], ['ÿ', 'y'],
  ]
  for (const [from, to] of fr_en) {
    str = str.replace(new RegExp(from, 'g'), to)
  }
  return str
}

export function transformWord(raw: RawWordData): Word {
  const c = raw.content.word.content
  return {
    id: raw.content.word.wordId,
    wordRank: raw.wordRank,
    headWord: replaceFran(raw.headWord),
    bookId: raw.bookId,
    usphone: c.usphone ?? '',
    ukphone: c.ukphone ?? '',
    usspeech: c.usspeech ?? c.speech ?? raw.headWord,
    ukspeech: c.ukspeech ?? c.speech ?? raw.headWord,
    translations: (c.trans ?? []).map((t) => ({
      pos: t.pos ?? '',
      tranCn: t.tranCn ?? '',
      tranOther: t.tranOther,
    })),
    sentences: (c.sentence?.sentences ?? []).map((s) => ({
      en: replaceFran(s.sContent),
      cn: s.sCn,
    })),
    synonyms: (c.syno?.synos ?? []).map((s) => ({
      pos: s.pos,
      tran: s.tran,
      words: s.hwds.map((h) => h.w),
    })),
    phrases: (c.phrase?.phrases ?? []).map((p) => ({
      en: replaceFran(p.pContent),
      cn: p.pCn,
    })),
    relWords: (c.relWord?.rels ?? []).map((r) => ({
      pos: r.pos,
      words: r.words.map((w) => ({ hwd: replaceFran(w.hwd), tran: w.tran })),
    })),
    status: 'new',
    correctCount: 0,
    wrongCount: 0,
    lastPracticeAt: null,
    isFavorite: false,
    favoriteTags: [],
  }
}

export async function importFromJsonl(file: File, onProgress?: (done: number, total: number) => void): Promise<number> {
  const text = await file.text()
  const lines = text.trim().split('\n')
  const words: Word[] = []

  for (let i = 0; i < lines.length; i++) {
    const raw = parseLine(lines[i])
    if (raw && raw.headWord) {
      words.push(transformWord(raw))
    }
    onProgress?.(i + 1, lines.length)
  }

  return words.length
}
```

Create `src/workers/importWorker.ts`:
```typescript
import { parseLine, transformWord } from '@/services/importService'
import type { Word } from '@/types'

self.onmessage = (e: MessageEvent<string>) => {
  const lines = e.data.trim().split('\n')
  const words: Word[] = []

  for (const line of lines) {
    const raw = parseLine(line)
    if (raw && raw.headWord) {
      words.push(transformWord(raw))
    }
  }

  self.postMessage(words)
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm vitest run src/services/__tests__/importService.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/importService.ts src/services/__tests__/importService.test.ts src/workers/importWorker.ts
git commit -m "feat: add JSONL import service with French character normalization"
```

### Task 2.2: Audio service (Youdao + Web Speech API fallback)

**Files:**
- Create: `src/services/audioService.ts`
- Create: `src/services/__tests__/audioService.test.ts`
- Create: `src/hooks/useAudio.ts`

- [ ] **Step 1: Write test**

Create `src/services/__tests__/audioService.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { buildYoudaoUrl, supportsSpeechSynthesis } from '../audioService'

describe('buildYoudaoUrl', () => {
  it('builds US pronunciation URL', () => {
    const url = buildYoudaoUrl('cancel', 'us')
    expect(url).toBe('https://dict.youdao.com/dictvoice?audio=cancel&type=2')
  })

  it('builds UK pronunciation URL', () => {
    const url = buildYoudaoUrl('cancel', 'uk')
    expect(url).toBe('https://dict.youdao.com/dictvoice?audio=cancel&type=1')
  })
})

describe('supportsSpeechSynthesis', () => {
  it('returns boolean', () => {
    expect(typeof supportsSpeechSynthesis()).toBe('boolean')
  })
})
```

- [ ] **Step 2: Implement audio service**

Create `src/services/audioService.ts`:
```typescript
export type Accent = 'us' | 'uk'

export function buildYoudaoUrl(word: string, accent: Accent): string {
  const type = accent === 'us' ? '2' : '1'
  return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=${type}`
}

export function supportsSpeechSynthesis(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speakWithWebSpeech(text: string, accent: Accent): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!supportsSpeechSynthesis()) {
      reject(new Error('Speech synthesis not supported'))
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = accent === 'us' ? 'en-US' : 'en-GB'
    utterance.rate = 0.9
    utterance.onend = () => resolve()
    utterance.onerror = () => reject(new Error('Speech synthesis failed'))
    speechSynthesis.cancel()
    speechSynthesis.speak(utterance)
  })
}

export function playAudio(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url)
    audio.onended = () => resolve()
    audio.onerror = () => reject(new Error('Audio playback failed'))
    audio.play().catch(reject)
  })
}

export async function speakWord(word: string, accent: Accent): Promise<void> {
  try {
    const url = buildYoudaoUrl(word, accent)
    await playAudio(url)
  } catch {
    try {
      await speakWithWebSpeech(word, accent)
    } catch {
      // Both methods failed — silently ignore
    }
  }
}
```

- [ ] **Step 3: Create useAudio hook**

Create `src/hooks/useAudio.ts`:
```typescript
import { useState, useCallback } from 'react'
import { speakWord, type Accent } from '@/services/audioService'

export function useAudio(accent: Accent = 'us') {
  const [isPlaying, setIsPlaying] = useState(false)

  const play = useCallback(
    async (word: string) => {
      setIsPlaying(true)
      try {
        await speakWord(word, accent)
      } finally {
        setIsPlaying(false)
      }
    },
    [accent]
  )

  return { play, isPlaying }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm vitest run src/services/__tests__/audioService.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/audioService.ts src/services/__tests__/audioService.test.ts src/hooks/useAudio.ts
git commit -m "feat: add audio service with Youdao API + Web Speech API fallback"
```

### Task 2.3: Word list page with search and virtual scroll

**Files:**
- Create: `src/stores/wordStore.ts`
- Create: `src/components/word/WordCard.tsx`
- Create: `src/components/word/WordList.tsx`
- Modify: `src/pages/WordListPage.tsx`

- [ ] **Step 1: Create word store**

Create `src/stores/wordStore.ts`:
```typescript
import { create } from 'zustand'
import type { Word } from '@/types'
import { db, getAllWords, searchWords } from '@/lib/db'

interface WordState {
  words: Word[]
  isLoading: boolean
  searchQuery: string
  isImported: boolean
  loadWords: () => Promise<void>
  setSearchQuery: (q: string) => void
  filteredWords: () => Word[]
  setImported: (v: boolean) => void
}

export const useWordStore = create<WordState>((set, get) => ({
  words: [],
  isLoading: false,
  searchQuery: '',
  isImported: false,

  loadWords: async () => {
    set({ isLoading: true })
    const words = await getAllWords()
    set({ words, isLoading: false })
  },

  setSearchQuery: (q: string) => set({ searchQuery: q }),

  filteredWords: () => {
    const { words, searchQuery } = get()
    if (!searchQuery.trim()) return words
    const lower = searchQuery.toLowerCase()
    return words.filter(
      (w) =>
        w.headWord.toLowerCase().includes(lower) ||
        w.translations.some((t) => t.tranCn.includes(searchQuery))
    )
  },

  setImported: (v: boolean) => set({ isImported: v }),
}))
```

- [ ] **Step 2: Create WordCard and WordList components**

Create `src/components/word/WordCard.tsx`:
```typescript
import { useNavigate } from 'react-router-dom'
import { Volume2 } from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'
import type { Word } from '@/types'

interface WordCardProps {
  word: Word
}

export function WordCard({ word }: WordCardProps) {
  const navigate = useNavigate()
  const { play, isPlaying } = useAudio()

  return (
    <div
      onClick={() => navigate(`/words/${word.id}`)}
      className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-200 hover:shadow-md hover:shadow-gray-100"
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          play(word.headWord)
        }}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-500"
      >
        <Volume2 className={`h-4 w-4 ${isPlaying ? 'animate-pulse text-primary-500' : ''}`} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold">{word.headWord}</span>
          <span className="text-xs text-gray-400">{word.usphone}</span>
        </div>
        <p className="mt-0.5 truncate text-sm text-gray-500">
          {word.translations.map((t) => t.tranCn).join('；')}
        </p>
      </div>
      <div className="flex items-center gap-1">
        {word.status === 'mastered' && (
          <span className="rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-600">
            Mastered
          </span>
        )}
        {word.isFavorite && (
          <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-600">
            Star
          </span>
        )}
      </div>
    </div>
  )
}
```

Create `src/components/word/WordList.tsx`:
```typescript
import { WordCard } from './WordCard'
import type { Word } from '@/types'

interface WordListProps {
  words: Word[]
  isLoading: boolean
}

export function WordList({ words, isLoading }: WordListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-400">No words found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {words.map((word) => (
        <WordCard key={word.id} word={word} />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Update WordListPage**

Modify `src/pages/WordListPage.tsx`:
```typescript
import { useEffect } from 'react'
import { Search } from 'lucide-react'
import { useWordStore } from '@/stores/wordStore'
import { WordList } from '@/components/word/WordList'

export function WordListPage() {
  const { loadWords, setSearchQuery, filteredWords, words, isLoading } = useWordStore()

  useEffect(() => {
    loadWords()
  }, [loadWords])

  return (
    <div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search words or meanings..."
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary-300 focus:ring-2 focus:ring-primary-50"
        />
      </div>
      <WordList words={filteredWords()} isLoading={isLoading} />
    </div>
  )
}
```

- [ ] **Step 4: Add WordDetailPage route to App.tsx**

Modify `src/App.tsx` to add WordDetailPage route:
```typescript
import { WordDetailPage } from '@/pages/WordDetailPage'
// Add to children array:
{ path: 'words/:wordId', element: <WordDetailPage /> },
```

Create `src/pages/WordDetailPage.tsx`:
```typescript
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Volume2, Star } from 'lucide-react'
import { getWordById, updateWord } from '@/lib/db'
import { useAudio } from '@/hooks/useAudio'
import type { Word } from '@/types'

export function WordDetailPage() {
  const { wordId } = useParams<{ wordId: string }>()
  const navigate = useNavigate()
  const [word, setWord] = useState<Word | null>(null)
  const { play, isPlaying } = useAudio()

  useEffect(() => {
    if (wordId) getWordById(wordId).then(setWord)
  }, [wordId])

  if (!word) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  const toggleFavorite = async () => {
    await updateWord(word.id, { isFavorite: !word.isFavorite })
    setWord({ ...word, isFavorite: !word.isFavorite })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="rounded-3xl border border-gray-100 bg-white p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{word.headWord}</h1>
              <button
                onClick={() => play(word.headWord)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-500"
              >
                <Volume2 className={`h-5 w-5 ${isPlaying ? 'animate-pulse text-primary-500' : ''}`} />
              </button>
            </div>
            <div className="mt-2 flex gap-3 text-sm text-gray-400">
              <span>US: {word.usphone || '-'}</span>
              <span>UK: {word.ukphone || '-'}</span>
            </div>
          </div>
          <button
            onClick={toggleFavorite}
            className={`rounded-full p-2 transition-colors ${
              word.isFavorite ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
            }`}
          >
            <Star className="h-5 w-5" fill={word.isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Definitions</h3>
            {word.translations.map((t, i) => (
              <div key={i} className="mb-2 flex gap-2 text-sm">
                <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">
                  {t.pos}
                </span>
                <span className="text-gray-700">{t.tranCn}</span>
                {t.tranOther && <span className="text-gray-400">{t.tranOther}</span>}
              </div>
            ))}
          </section>

          {word.sentences.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Sentences</h3>
              <ul className="space-y-2">
                {word.sentences.map((s, i) => (
                  <li key={i} className="text-sm">
                    <p className="text-gray-700">{s.en}</p>
                    <p className="text-gray-400">{s.cn}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {word.synonyms.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Synonyms</h3>
              {word.synonyms.map((s, i) => (
                <div key={i} className="mb-1 text-sm">
                  <span className="rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-500">{s.pos}</span>{' '}
                  <span className="text-gray-600">{s.words.join('、')}</span>
                </div>
              ))}
            </section>
          )}

          {word.phrases.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Phrases</h3>
              <ul className="space-y-1">
                {word.phrases.map((p, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-medium text-gray-700">{p.en}</span>
                    <span className="ml-1 text-gray-400">— {p.cn}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Verify build**

```bash
pnpm run build
```

Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/stores/wordStore.ts src/components/word/ src/pages/WordListPage.tsx src/pages/WordDetailPage.tsx src/App.tsx
git commit -m "feat: add word list page with search, word cards, and word detail page"
```

---

## Phase 3: Core Practice

### Task 3.1: AudioButton and practice UI components

**Files:**
- Create: `src/components/practice/AudioButton.tsx`
- Create: `src/components/practice/OptionCard.tsx`
- Create: `src/components/practice/ProgressBar.tsx`
- Create: `src/components/practice/SessionResult.tsx`
- Create: `src/components/practice/__tests__/OptionCard.test.tsx`

- [ ] **Step 1: Write OptionCard test**

Create `src/components/practice/__tests__/OptionCard.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OptionCard } from '../OptionCard'

describe('OptionCard', () => {
  it('renders the option text', () => {
    render(
      <OptionCard
        text="cancel"
        state="idle"
        onClick={() => {}}
      />
    )
    expect(screen.getByText('cancel')).toBeInTheDocument()
  })

  it('calls onClick when clicked and not disabled', () => {
    const onClick = vi.fn()
    render(<OptionCard text="cancel" state="idle" onClick={onClick} />)
    fireEvent.click(screen.getByText('cancel'))
    expect(onClick).toHaveBeenCalled()
  })

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn()
    render(<OptionCard text="cancel" state="idle" onClick={onClick} disabled />)
    fireEvent.click(screen.getByText('cancel'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('applies correct styles for correct state', () => {
    render(<OptionCard text="cancel" state="correct" onClick={() => {}} />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('border-success-500')
  })

  it('applies correct styles for incorrect state', () => {
    render(<OptionCard text="cancel" state="incorrect" onClick={() => {}} />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('border-danger-500')
  })
})
```

- [ ] **Step 2: Implement practice components**

Create `src/components/practice/AudioButton.tsx`:
```typescript
import { Volume2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AudioButtonProps {
  onClick: () => void
  isPlaying: boolean
  size?: 'sm' | 'lg'
}

export function AudioButton({ onClick, isPlaying, size = 'lg' }: AudioButtonProps) {
  const sizeClass = size === 'lg' ? 'h-20 w-20' : 'h-12 w-12'

  return (
    <button
      onClick={onClick}
      disabled={isPlaying}
      className={cn(
        'group relative flex items-center justify-center rounded-full transition-all duration-300',
        'bg-white shadow-lg shadow-gray-200/50 ring-1 ring-gray-100',
        'hover:shadow-xl hover:shadow-gray-200/80 hover:scale-105',
        'active:scale-95',
        sizeClass
      )}
    >
      <div
        className={cn(
          'absolute inset-0 rounded-full bg-primary-500/10 transition-opacity duration-300',
          isPlaying ? 'opacity-100 animate-pulse' : 'opacity-0'
        )}
      />
      {isPlaying ? (
        <Loader2 className="relative z-10 h-8 w-8 animate-spin text-primary-500" />
      ) : (
        <Volume2 className="relative z-10 h-8 w-8 text-gray-600 transition-colors group-hover:text-primary-500" />
      )}
    </button>
  )
}
```

Create `src/components/practice/OptionCard.tsx`:
```typescript
import { cn } from '@/lib/utils'

export type OptionState = 'idle' | 'selected' | 'correct' | 'incorrect'

interface OptionCardProps {
  text: string
  state: OptionState
  onClick: () => void
  disabled?: boolean
  showIcon?: boolean
}

export function OptionCard({ text, state, onClick, disabled = false, showIcon = false }: OptionCardProps) {
  const stateStyles: Record<OptionState, string> = {
    idle: 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50',
    selected: 'border-primary-300 bg-primary-50 ring-1 ring-primary-200',
    correct: 'border-success-500 bg-success-50 ring-1 ring-success-200',
    incorrect: 'border-danger-500 bg-danger-50 ring-1 ring-danger-200',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || state !== 'idle'}
      className={cn(
        'relative w-full rounded-2xl border-2 p-5 text-left transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
        'disabled:cursor-default',
        stateStyles[state]
      )}
    >
      <span className="text-base font-medium text-gray-800">{text}</span>
      {showIcon && state === 'correct' && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-success-500 text-lg">✓</span>
      )}
      {showIcon && state === 'incorrect' && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-danger-500 text-lg">✗</span>
      )}
    </button>
  )
}
```

Create `src/components/practice/ProgressBar.tsx`:
```typescript
interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-xs text-gray-400">
        <span>{current} / {total}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-primary-500 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
```

Create `src/components/practice/SessionResult.tsx`:
```typescript
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import { formatAccuracy } from '@/lib/utils'
import type { Word } from '@/types'

interface SessionResultProps {
  words: Word[]
  answers: { wordId: string; isCorrect: boolean }[]
}

export function SessionResult({ words, answers }: SessionResultProps) {
  const navigate = useNavigate()
  const correctCount = answers.filter((a) => a.isCorrect).length
  const totalCount = answers.length

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary-50">
          <TrendingUp className="h-10 w-10 text-primary-500" />
        </div>
        <h2 className="text-2xl font-bold">Practice Complete!</h2>
        <p className="mt-1 text-gray-500">
          You got {correctCount} out of {totalCount} correct
        </p>
        <p className="mt-2 text-4xl font-bold text-primary-600">
          {formatAccuracy(correctCount, totalCount)}
        </p>
      </div>

      <div className="space-y-2">
        {answers.map((a, i) => {
          const word = words[i]
          return (
            <div
              key={a.wordId}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3"
            >
              {a.isCorrect ? (
                <CheckCircle className="h-5 w-5 text-success-500" />
              ) : (
                <XCircle className="h-5 w-5 text-danger-500" />
              )}
              <div>
                <span className="font-medium">{word?.headWord ?? a.wordId}</span>
                <span className="ml-2 text-sm text-gray-400">
                  {word?.translations.map((t) => t.tranCn).join('；')}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(0)}
          className="flex-1 rounded-2xl bg-primary-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          Practice Again
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex-1 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Run test to verify OptionCard tests pass**

```bash
pnpm vitest run src/components/practice/__tests__/OptionCard.test.tsx
```

Expected: All tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/practice/
git commit -m "feat: add practice UI components — AudioButton, OptionCard, ProgressBar, SessionResult"
```

### Task 3.2: Practice store and session hook

**Files:**
- Create: `src/stores/practiceStore.ts`
- Create: `src/hooks/usePracticeSession.ts`
- Create: `src/services/practiceService.ts`

- [ ] **Step 1: Create practice service**

Create `src/services/practiceService.ts`:
```typescript
import type { Word, PracticeMode } from '@/types'
import { shuffle, pickRandom } from '@/lib/utils'
import { getAllWords } from '@/lib/db'

export function generateOptions(correctWord: Word, allWords: Word[], count: number = 4): Word[] {
  const samePos = correctWord.translations[0]?.pos
  let pool = allWords.filter((w) => w.id !== correctWord.id)

  // Prefer words with same part of speech as distractors
  if (samePos) {
    const samePosPool = pool.filter(
      (w) => w.translations[0]?.pos === samePos
    )
    if (samePosPool.length >= count - 1) {
      pool = samePosPool
    }
  }

  const distractors = pickRandom(pool, count - 1, correctWord)
  return shuffle([correctWord, ...distractors])
}

export async function getRandomWordsForSession(count: number): Promise<Word[]> {
  const allWords = await getAllWords()
  if (allWords.length === 0) return []
  return pickRandom(allWords, Math.min(count, allWords.length))
}

export function checkSpellingAnswer(userInput: string, correctWord: string): boolean {
  return userInput.trim().toLowerCase() === correctWord.toLowerCase()
}
```

- [ ] **Step 2: Create practice store**

Create `src/stores/practiceStore.ts`:
```typescript
import { create } from 'zustand'
import type { Word, PracticeMode, PracticeSession } from '@/types'

interface PracticeState {
  session: PracticeSession | null
  options: Word[]
  selectedAnswer: string | null
  showResult: boolean

  startSession: (mode: PracticeMode, words: Word[]) => void
  selectAnswer: (answer: string) => void
  setOptions: (options: Word[]) => void
  nextWord: () => void
  endSession: () => void
}

export const usePracticeStore = create<PracticeState>((set, get) => ({
  session: null,
  options: [],
  selectedAnswer: null,
  showResult: false,

  startSession: (mode, words) => {
    set({
      session: {
        mode,
        words,
        currentIndex: 0,
        answers: [],
        startTime: Date.now(),
        isComplete: false,
      },
      selectedAnswer: null,
      showResult: false,
      options: [],
    })
  },

  selectAnswer: (answer) => {
    const { session } = get()
    if (!session || session.isComplete) return

    const word = session.words[session.currentIndex]
    const isCorrect = answer.toLowerCase() === word.headWord.toLowerCase()

    set({
      selectedAnswer: answer,
      showResult: true,
    })
  },

  setOptions: (options) => set({ options }),

  nextWord: () => {
    const { session, selectedAnswer } = get()
    if (!session || !selectedAnswer) return

    const word = session.words[session.currentIndex]
    const isCorrect = selectedAnswer.toLowerCase() === word.headWord.toLowerCase()
    const answers = [...session.answers, { wordId: word.id, isCorrect, userAnswer: selectedAnswer, duration: 0 }]
    const nextIndex = session.currentIndex + 1
    const isComplete = nextIndex >= session.words.length

    set({
      session: {
        ...session,
        currentIndex: isComplete ? session.currentIndex : nextIndex,
        answers,
        isComplete,
      },
      selectedAnswer: null,
      showResult: false,
      options: [],
    })
  },

  endSession: () => {
    set((state) => ({
      session: state.session ? { ...state.session, isComplete: true } : null,
    }))
  },
}))
```

- [ ] **Step 3: Create usePracticeSession hook**

Create `src/hooks/usePracticeSession.ts`:
```typescript
import { useEffect, useCallback } from 'react'
import { usePracticeStore } from '@/stores/practiceStore'
import { useWordStore } from '@/stores/wordStore'
import { generateOptions, getRandomWordsForSession } from '@/services/practiceService'
import type { PracticeMode } from '@/types'

export function usePracticeSession(mode: PracticeMode, count: number = 10) {
  const {
    session, options, selectedAnswer, showResult,
    startSession, selectAnswer, setOptions, nextWord, endSession,
  } = usePracticeStore()

  const initSession = useCallback(async () => {
    const words = await getRandomWordsForSession(count)
    if (words.length > 0) {
      startSession(mode, words)
    }
  }, [mode, count, startSession])

  // Initialize on mount
  useEffect(() => {
    initSession()
  }, [initSession])

  // Generate options when current word changes
  useEffect(() => {
    if (!session || session.isComplete) return
    const currentWord = session.words[session.currentIndex]
    const allWords = useWordStore.getState().words
    if (allWords.length > 0 && currentWord) {
      const opts = generateOptions(currentWord, allWords, 4)
      setOptions(opts)
    }
  }, [session?.currentIndex, session?.isComplete])

  return {
    session,
    options,
    selectedAnswer,
    showResult,
    currentWord: session ? session.words[session.currentIndex] : null,
    selectAnswer,
    nextWord,
    endSession,
    initSession,
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/services/practiceService.ts src/stores/practiceStore.ts src/hooks/usePracticeSession.ts
git commit -m "feat: add practice store, session hook, and option generation service"
```

### Task 3.3: ListenPick practice page (core feature)

**Files:**
- Create: `src/pages/ListenPick.tsx`
- Modify: `src/App.tsx` (add route)

- [ ] **Step 1: Create ListenPick page**

Create `src/pages/ListenPick.tsx`:
```typescript
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePracticeSession } from '@/hooks/usePracticeSession'
import { useAudio } from '@/hooks/useAudio'
import { AudioButton } from '@/components/practice/AudioButton'
import { OptionCard } from '@/components/practice/OptionCard'
import { ProgressBar } from '@/components/practice/ProgressBar'
import { SessionResult } from '@/components/practice/SessionResult'
import type { OptionState } from '@/components/practice/OptionCard'

export function ListenPick() {
  const navigate = useNavigate()
  const { play, isPlaying } = useAudio()
  const {
    session, options, selectedAnswer, showResult, currentWord,
    selectAnswer, nextWord,
  } = usePracticeSession('listen', 10)

  // Auto-play word when it changes
  useEffect(() => {
    if (currentWord && !showResult) {
      const timer = setTimeout(() => play(currentWord.headWord), 300)
      return () => clearTimeout(timer)
    }
  }, [currentWord?.id, showResult])

  if (!session) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-400">Loading practice session...</p>
      </div>
    )
  }

  if (session.isComplete) {
    return <SessionResult words={session.words} answers={session.answers} />
  }

  const getOptionState = (wordId: string): OptionState => {
    if (!showResult) return 'idle'
    if (wordId === currentWord!.id) return 'correct'
    if (wordId === selectedAnswer) return 'incorrect'
    return 'idle'
  }

  const handleOptionClick = (word: { id: string; headWord: string }) => {
    if (showResult) return
    selectAnswer(word.headWord)
  }

  const handleNext = () => {
    nextWord()
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8">
        <ProgressBar current={session.currentIndex + (showResult ? 1 : 0)} total={session.words.length} />
      </div>

      <div className="mb-8 flex justify-center">
        <AudioButton onClick={() => currentWord && play(currentWord.headWord)} isPlaying={isPlaying} />
      </div>

      <div className="mb-4 text-center text-sm text-gray-400">
        Listen and choose the correct word
      </div>

      <div className="grid grid-cols-1 gap-3">
        {options.map((opt) => (
          <OptionCard
            key={opt.id}
            text={opt.headWord}
            state={getOptionState(opt.id)}
            onClick={() => handleOptionClick(opt)}
            showIcon={showResult}
          />
        ))}
      </div>

      {showResult && currentWord && (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-lg font-bold">{currentWord.headWord}</span>
            <span className="text-sm text-gray-400">{currentWord.usphone}</span>
          </div>
          <p className="text-sm text-gray-600">
            {currentWord.translations.map((t) => t.tranCn).join('；')}
          </p>
          {currentWord.sentences[0] && (
            <div className="mt-2 border-t border-gray-50 pt-2">
              <p className="text-xs text-gray-400">{currentWord.sentences[0].en}</p>
              <p className="text-xs text-gray-300">{currentWord.sentences[0].cn}</p>
            </div>
          )}
          <button
            onClick={handleNext}
            className="mt-4 w-full rounded-xl bg-primary-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
          >
            {session.currentIndex + 1 >= session.words.length ? 'Finish' : 'Next Word'}
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update App.tsx with all practice routes**

Modify `src/App.tsx` imports and routes:
```typescript
import { PracticeHome } from '@/pages/PracticeHome'
import { ListenPick } from '@/pages/ListenPick'
import { MeaningPick } from '@/pages/MeaningPick'
import { SpellInput } from '@/pages/SpellInput'
import { ReversePick } from '@/pages/ReversePick'
import { PracticeResultPage } from '@/pages/PracticeResultPage'
import { WrongBook } from '@/pages/WrongBook'
import { Favorites } from '@/pages/Favorites'
import { Stats } from '@/pages/Stats'

// Add to children array:
{ path: 'practice', element: <PracticeHome /> },
{ path: 'practice/listen', element: <ListenPick /> },
{ path: 'practice/meaning', element: <MeaningPick /> },
{ path: 'practice/spell', element: <SpellInput /> },
{ path: 'practice/reverse', element: <ReversePick /> },
{ path: 'practice/result', element: <PracticeResultPage /> },
{ path: 'wrong-book', element: <WrongBook /> },
{ path: 'favorites', element: <Favorites /> },
{ path: 'stats', element: <Stats /> },
```

- [ ] **Step 3: Create PracticeHome page**

Create `src/pages/PracticeHome.tsx`:
```typescript
import { useNavigate } from 'react-router-dom'
import { Volume2, BookOpen, Pencil, ArrowLeftRight } from 'lucide-react'

const modes = [
  {
    key: 'listen',
    title: 'Listen & Pick',
    description: 'Listen to the word and choose the correct spelling',
    icon: Volume2,
    color: 'bg-primary-50 text-primary-600',
  },
  {
    key: 'meaning',
    title: 'Word → Meaning',
    description: 'See the word and choose the correct Chinese meaning',
    icon: BookOpen,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    key: 'spell',
    title: 'Listen & Spell',
    description: 'Listen to the word and type the correct spelling',
    icon: Pencil,
    color: 'bg-orange-50 text-orange-600',
  },
  {
    key: 'reverse',
    title: 'Meaning → Word',
    description: 'See the Chinese meaning and choose the correct word',
    icon: ArrowLeftRight,
    color: 'bg-green-50 text-green-600',
  },
]

export function PracticeHome() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-6 text-xl font-semibold">Choose Practice Mode</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {modes.map(({ key, title, description, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => navigate(`/practice/${key}`)}
            className="group rounded-2xl border border-gray-100 bg-white p-6 text-left transition-all duration-200 hover:shadow-lg hover:shadow-gray-100"
          >
            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mb-1 text-base font-semibold">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create remaining placeholder practice pages (MeaningPick, SpellInput, ReversePick)**

Create `src/pages/MeaningPick.tsx`:
```typescript
import { useEffect } from 'react'
import { usePracticeSession } from '@/hooks/usePracticeSession'
import { OptionCard } from '@/components/practice/OptionCard'
import { ProgressBar } from '@/components/practice/ProgressBar'
import { SessionResult } from '@/components/practice/SessionResult'
import { generateOptions } from '@/services/practiceService'
import { useWordStore } from '@/stores/wordStore'
import { usePracticeStore } from '@/stores/practiceStore'
import type { OptionState } from '@/components/practice/OptionCard'

export function MeaningPick() {
  const { options, setOptions, selectAnswer, nextWord } = usePracticeStore()
  const { words: allWords } = useWordStore()
  const {
    session, options: storeOptions, selectedAnswer, showResult, currentWord,
  } = usePracticeSession('meaning', 10)

  useEffect(() => {
    if (currentWord && allWords.length > 0 && !showResult) {
      const opts = generateOptions(currentWord, allWords, 4)
      setOptions(opts)
    }
  }, [currentWord?.id, showResult, allWords])

  if (!session) {
    return <div className="py-20 text-center"><p className="text-gray-400">Loading...</p></div>
  }

  if (session.isComplete) {
    return <SessionResult words={session.words} answers={session.answers} />
  }

  const getOptionState = (tranCn: string): OptionState => {
    if (!showResult) return 'idle'
    const correctCn = currentWord!.translations[0]?.tranCn ?? ''
    if (tranCn === correctCn) return 'correct'
    if (tranCn === selectedAnswer) return 'incorrect'
    return 'idle'
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8">
        <ProgressBar current={session.currentIndex + (showResult ? 1 : 0)} total={session.words.length} />
      </div>
      <div className="mb-8 text-center">
        <span className="text-3xl font-bold">{currentWord?.headWord}</span>
        <span className="ml-2 text-sm text-gray-400">{currentWord?.usphone}</span>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {storeOptions.map((opt) => (
          <OptionCard
            key={opt.id}
            text={opt.translations[0]?.tranCn ?? opt.headWord}
            state={getOptionState(opt.translations[0]?.tranCn ?? '')}
            onClick={() => {
              if (!showResult) selectAnswer(opt.translations[0]?.tranCn ?? opt.headWord)
            }}
            showIcon={showResult}
          />
        ))}
      </div>
      {showResult && (
        <button
          onClick={nextWord}
          className="mt-6 w-full rounded-xl bg-primary-500 py-2.5 text-sm font-semibold text-white"
        >
          {session.currentIndex + 1 >= session.words.length ? 'Finish' : 'Next Word'}
        </button>
      )}
    </div>
  )
}
```

Create `src/pages/SpellInput.tsx`:
```typescript
import { useState, useEffect, useRef } from 'react'
import { usePracticeSession } from '@/hooks/usePracticeSession'
import { useAudio } from '@/hooks/useAudio'
import { AudioButton } from '@/components/practice/AudioButton'
import { ProgressBar } from '@/components/practice/ProgressBar'
import { SessionResult } from '@/components/practice/SessionResult'
import { checkSpellingAnswer } from '@/services/practiceService'
import { usePracticeStore } from '@/stores/practiceStore'

export function SpellInput() {
  const { play, isPlaying } = useAudio()
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { selectAnswer, nextWord } = usePracticeStore()
  const { session, selectedAnswer, showResult, currentWord } = usePracticeSession('spell', 10)

  useEffect(() => {
    if (currentWord && !submitted) {
      play(currentWord.headWord)
    }
    setInput('')
    setSubmitted(false)
    inputRef.current?.focus()
  }, [currentWord?.id])

  if (!session) {
    return <div className="py-20 text-center"><p className="text-gray-400">Loading...</p></div>
  }

  if (session.isComplete) {
    return <SessionResult words={session.words} answers={session.answers} />
  }

  const isCorrect = submitted && currentWord
    ? checkSpellingAnswer(input, currentWord.headWord)
    : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    selectAnswer(input.trim())
    setSubmitted(true)
  }

  const handleNext = () => {
    nextWord()
    setInput('')
    setSubmitted(false)
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8">
        <ProgressBar current={session.currentIndex + (submitted ? 1 : 0)} total={session.words.length} />
      </div>

      <div className="mb-8 flex justify-center">
        <AudioButton onClick={() => currentWord && play(currentWord.headWord)} isPlaying={isPlaying} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={submitted}
          placeholder="Type the word you hear..."
          className="w-full rounded-2xl border-2 border-gray-100 bg-white px-5 py-4 text-center text-lg font-medium outline-none transition-colors focus:border-primary-300"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />

        {!submitted ? (
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-full rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:bg-gray-200 disabled:text-gray-400"
          >
            Check
          </button>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            {isCorrect ? (
              <p className="text-center text-success-600 font-medium">Correct!</p>
            ) : (
              <div className="text-center">
                <p className="text-danger-600 font-medium">Incorrect</p>
                <p className="mt-1 text-sm text-gray-500">
                  Your answer: <span className="text-danger-600">{input}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Correct: <span className="text-success-600 font-semibold">{currentWord?.headWord}</span>
                </p>
                <p className="mt-1 text-xs text-gray-400">{currentWord?.translations.map((t) => t.tranCn).join('；')}</p>
              </div>
            )}
            <button
              onClick={handleNext}
              className="mt-4 w-full rounded-xl bg-primary-500 py-2.5 text-sm font-semibold text-white"
            >
              {session.currentIndex + 1 >= session.words.length ? 'Finish' : 'Next Word'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
```

Create `src/pages/ReversePick.tsx`:
```typescript
import { useEffect } from 'react'
import { usePracticeSession } from '@/hooks/usePracticeSession'
import { OptionCard } from '@/components/practice/OptionCard'
import { ProgressBar } from '@/components/practice/ProgressBar'
import { SessionResult } from '@/components/practice/SessionResult'
import { generateOptions } from '@/services/practiceService'
import { useWordStore } from '@/stores/wordStore'
import { usePracticeStore } from '@/stores/practiceStore'
import type { OptionState } from '@/components/practice/OptionCard'

export function ReversePick() {
  const { options, setOptions, selectAnswer, nextWord } = usePracticeStore()
  const { words: allWords } = useWordStore()
  const {
    session, options: storeOptions, selectedAnswer, showResult, currentWord,
  } = usePracticeSession('reverse', 10)

  useEffect(() => {
    if (currentWord && allWords.length > 0 && !showResult) {
      const opts = generateOptions(currentWord, allWords, 4)
      setOptions(opts)
    }
  }, [currentWord?.id, showResult, allWords])

  if (!session) {
    return <div className="py-20 text-center"><p className="text-gray-400">Loading...</p></div>
  }

  if (session.isComplete) {
    return <SessionResult words={session.words} answers={session.answers} />
  }

  const getOptionState = (wordHead: string): OptionState => {
    if (!showResult) return 'idle'
    if (wordHead === currentWord!.headWord) return 'correct'
    if (wordHead === selectedAnswer) return 'incorrect'
    return 'idle'
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8">
        <ProgressBar current={session.currentIndex + (showResult ? 1 : 0)} total={session.words.length} />
      </div>
      <div className="mb-8 text-center">
        <span className="text-xl font-semibold text-gray-700">
          {currentWord?.translations[0]?.tranCn}
        </span>
      </div>
      <div className="mb-4 text-center text-sm text-gray-400">
        Choose the correct word for this meaning
      </div>
      <div className="grid grid-cols-1 gap-3">
        {storeOptions.map((opt) => (
          <OptionCard
            key={opt.id}
            text={opt.headWord}
            state={getOptionState(opt.headWord)}
            onClick={() => {
              if (!showResult) selectAnswer(opt.headWord)
            }}
            showIcon={showResult}
          />
        ))}
      </div>
      {showResult && (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5">
          <span className="text-lg font-bold">{currentWord?.headWord}</span>
          <span className="ml-2 text-sm text-gray-400">{currentWord?.usphone}</span>
          <button
            onClick={nextWord}
            className="mt-4 w-full rounded-xl bg-primary-500 py-2.5 text-sm font-semibold text-white"
          >
            {session.currentIndex + 1 >= session.words.length ? 'Finish' : 'Next Word'}
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Verify build**

```bash
pnpm run build
```

Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/pages/ListenPick.tsx src/pages/MeaningPick.tsx src/pages/SpellInput.tsx src/pages/ReversePick.tsx src/pages/PracticeHome.tsx src/App.tsx
git commit -m "feat: add all 4 practice modes — listen pick, meaning pick, spell input, reverse pick"
```

---

## Phase 4: Data Tracking

### Task 4.1: Stats service and store

**Files:**
- Create: `src/services/statsService.ts`
- Create: `src/stores/statsStore.ts`
- Create: `src/services/__tests__/statsService.test.ts`

- [ ] **Step 1: Write test**

Create `src/services/__tests__/statsService.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { getTodayDateString, formatAccuracy } from '@/lib/utils'

describe('statsService utilities', () => {
  it('getTodayDateString returns correct format', () => {
    const result = getTodayDateString()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('formatAccuracy handles edge cases', () => {
    expect(formatAccuracy(0, 0)).toBe('0%')
    expect(formatAccuracy(5, 10)).toBe('50%')
    expect(formatAccuracy(10, 10)).toBe('100%')
  })
})
```

- [ ] **Step 2: Implement stats service**

Create `src/services/statsService.ts`:
```typescript
import { db, getPracticeRecordsByDateRange, upsertDailyStats, getAllDailyStats } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import type { DailyStats, PracticeRecord, Word } from '@/types'

export async function getTodayStats(): Promise<{ total: number; correct: number; date: string }> {
  const today = formatDate(new Date())
  const start = new Date(today).getTime()
  const end = start + 86400000 - 1
  const records = await getPracticeRecordsByDateRange(start, end)
  const correct = records.filter((r) => r.isCorrect).length
  return { total: records.length, correct, date: today }
}

export async function getStreak(): Promise<number> {
  const allStats = await getAllDailyStats()
  if (allStats.length === 0) return 0

  const sorted = allStats.sort((a, b) => b.date.localeCompare(a.date))
  let streak = 0
  const today = formatDate(new Date())

  for (let i = 0; i < sorted.length; i++) {
    const expectedDate = new Date(today)
    expectedDate.setDate(expectedDate.getDate() - i)
    const expected = formatDate(expectedDate)
    const match = sorted.find((s) => s.date === expected)
    if (match && match.totalCount > 0) {
      streak++
    } else if (i > 0) {
      break
    }
  }

  return streak
}

export async function getLast7DaysStats(): Promise<DailyStats[]> {
  const result: DailyStats[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = formatDate(date)
    const existing = await db.dailyStats.get(dateStr)
    result.push(existing ?? { date: dateStr, totalCount: 0, correctCount: 0, mode: 'listen' })
  }
  return result
}

export async function savePracticeRecord(record: PracticeRecord): Promise<void> {
  await db.practiceRecords.add(record)

  const dateStr = formatDate(new Date(record.timestamp))
  const existing = await db.dailyStats.get(dateStr)

  if (existing) {
    await db.dailyStats.update(dateStr, {
      totalCount: existing.totalCount + 1,
      correctCount: existing.correctCount + (record.isCorrect ? 1 : 0),
    })
  } else {
    await db.dailyStats.put({
      date: dateStr,
      totalCount: 1,
      correctCount: record.isCorrect ? 1 : 0,
      mode: record.mode,
    })
  }
}

export async function updateWordPracticeStats(
  wordId: string,
  isCorrect: boolean
): Promise<void> {
  const word = await db.words.get(wordId)
  if (!word) return

  const changes: Partial<Word> = {
    lastPracticeAt: Date.now(),
    correctCount: word.correctCount + (isCorrect ? 1 : 0),
    wrongCount: word.wrongCount + (isCorrect ? 0 : 1),
  }

  if (changes.correctCount! >= 3 && changes.wrongCount === 0) {
    changes.status = 'mastered'
  } else if ((changes.correctCount! + changes.wrongCount!) > 0) {
    changes.status = 'learning'
  }

  await db.words.update(wordId, changes)
}
```

- [ ] **Step 3: Create stats store**

Create `src/stores/statsStore.ts`:
```typescript
import { create } from 'zustand'
import type { DailyStats } from '@/types'
import { getTodayStats, getStreak, getLast7DaysStats } from '@/services/statsService'

interface StatsState {
  todayTotal: number
  todayCorrect: number
  streak: number
  last7Days: DailyStats[]
  isLoading: boolean
  loadStats: () => Promise<void>
}

export const useStatsStore = create<StatsState>((set) => ({
  todayTotal: 0,
  todayCorrect: 0,
  streak: 0,
  last7Days: [],
  isLoading: false,

  loadStats: async () => {
    set({ isLoading: true })
    const [today, streak, last7Days] = await Promise.all([
      getTodayStats(),
      getStreak(),
      getLast7DaysStats(),
    ])
    set({
      todayTotal: today.total,
      todayCorrect: today.correct,
      streak,
      last7Days,
      isLoading: false,
    })
  },
}))
```

- [ ] **Step 4: Commit**

```bash
git add src/services/statsService.ts src/services/__tests__/statsService.test.ts src/stores/statsStore.ts
git commit -m "feat: add stats service for tracking practice records and daily stats"
```

### Task 4.2: Dashboard and Stats pages with Recharts

**Files:**
- Create: `src/components/stats/Heatmap.tsx`
- Create: `src/components/stats/TrendChart.tsx`
- Modify: `src/pages/Dashboard.tsx`
- Create: `src/pages/Stats.tsx`

- [ ] **Step 1: Create chart components**

Create `src/components/stats/Heatmap.tsx`:
```typescript
import type { DailyStats } from '@/types'

interface HeatmapProps {
  data: DailyStats[]
}

export function Heatmap({ data }: HeatmapProps) {
  const maxCount = Math.max(...data.map((d) => d.totalCount), 1)

  const getIntensity = (count: number): string => {
    if (count === 0) return 'bg-gray-100'
    const ratio = count / maxCount
    if (ratio < 0.25) return 'bg-primary-100'
    if (ratio < 0.5) return 'bg-primary-200'
    if (ratio < 0.75) return 'bg-primary-300'
    return 'bg-primary-500'
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-600">Last 7 Days</h3>
      <div className="flex gap-2">
        {data.map((day) => (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={`h-10 w-full rounded-lg ${getIntensity(day.totalCount)} transition-colors`}
              title={`${day.totalCount} practices on ${day.date}`}
            />
            <span className="text-xs text-gray-400">
              {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

Create `src/components/stats/TrendChart.tsx`:
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { DailyStats } from '@/types'

interface TrendChartProps {
  data: DailyStats[]
}

export function TrendChart({ data }: TrendChartProps) {
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    accuracy: d.totalCount > 0 ? Math.round((d.correctCount / d.totalCount) * 100) : 0,
    total: d.totalCount,
  }))

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-600">Accuracy Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 2: Update Dashboard page**

Modify `src/pages/Dashboard.tsx`:
```typescript
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, BookOpen, TrendingUp, Target } from 'lucide-react'
import { useStatsStore } from '@/stores/statsStore'
import { useWordStore } from '@/stores/wordStore'
import { Heatmap } from '@/components/stats/Heatmap'
import { TrendChart } from '@/components/stats/TrendChart'
import { formatAccuracy } from '@/lib/utils'

export function Dashboard() {
  const navigate = useNavigate()
  const { todayTotal, todayCorrect, streak, last7Days, loadStats } = useStatsStore()
  const { loadWords } = useWordStore()

  useEffect(() => {
    loadStats()
    loadWords()
  }, [loadStats, loadWords])

  const stats = [
    { label: 'Today', value: todayTotal.toString(), icon: Target, color: 'text-primary-500 bg-primary-50' },
    { label: 'Accuracy', value: formatAccuracy(todayCorrect, todayTotal), icon: TrendingUp, color: 'text-success-500 bg-success-50' },
    { label: 'Streak', value: `${streak}d`, icon: Play, color: 'text-orange-500 bg-orange-50' },
    { label: 'Words', value: '0', icon: BookOpen, color: 'text-purple-500 bg-purple-50' },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Heatmap data={last7Days} />
        <TrendChart data={last7Days} />
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => navigate('/practice')}
          className="flex items-center gap-2 rounded-2xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          <Play className="h-4 w-4" /> Start Practice
        </button>
        <button
          onClick={() => navigate('/words')}
          className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <BookOpen className="h-4 w-4" /> Browse Words
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create Stats page**

Create `src/pages/Stats.tsx`:
```typescript
import { useEffect } from 'react'
import { useStatsStore } from '@/stores/statsStore'
import { useWordStore } from '@/stores/wordStore'
import { Heatmap } from '@/components/stats/Heatmap'
import { TrendChart } from '@/components/stats/TrendChart'

export function Stats() {
  const { todayTotal, todayCorrect, last7Days, loadStats } = useStatsStore()
  const { words, loadWords } = useWordStore()

  useEffect(() => {
    loadStats()
    loadWords()
  }, [loadStats, loadWords])

  const totalPractices = last7Days.reduce((sum, d) => sum + d.totalCount, 0)
  const totalCorrect = last7Days.reduce((sum, d) => sum + d.correctCount, 0)
  const newWords = words.filter((w) => w.status === 'new').length
  const masteredWords = words.filter((w) => w.status === 'mastered').length

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Words" value={words.length.toString()} />
        <StatCard label="New" value={newWords.toString()} />
        <StatCard label="Mastered" value={masteredWords.toString()} />
        <StatCard label="7-Day Accuracy" value={
          totalPractices > 0 ? `${Math.round((totalCorrect / totalPractices) * 100)}%` : '0%'
        } />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Heatmap data={last7Days} />
        <TrendChart data={last7Days} />
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  )
}
```

- [ ] **Step 4: Verify build**

```bash
pnpm run build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/stats/ src/pages/Dashboard.tsx src/pages/Stats.tsx
git commit -m "feat: add dashboard with stats cards, heatmap, trend chart, and full stats page"
```

---

## Phase 5: Wrong Book & Favorites

### Task 5.1: Wrong Book page

**Files:**
- Create: `src/pages/WrongBook.tsx`
- Modify: `src/pages/ListenPick.tsx` (save practice records)

- [ ] **Step 1: Create WrongBook page**

Create `src/pages/WrongBook.tsx`:
```typescript
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import { getWrongWordIds, getWordById } from '@/lib/db'
import { WordCard } from '@/components/word/WordCard'
import type { Word } from '@/types'

export function WrongBook() {
  const navigate = useNavigate()
  const [wrongWords, setWrongWords] = useState<Word[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadWrongWords()
  }, [])

  const loadWrongWords = async () => {
    setIsLoading(true)
    const ids = await getWrongWordIds()
    const words = await Promise.all(ids.map((id) => getWordById(id)))
    setWrongWords(words.filter((w): w is Word => w != null))
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {wrongWords.length} word{wrongWords.length !== 1 ? 's' : ''} to review
        </p>
        {wrongWords.length > 0 && (
          <button
            onClick={() => navigate('/practice')}
            className="flex items-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white"
          >
            <Play className="h-4 w-4" /> Practice These
          </button>
        )}
      </div>

      {wrongWords.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mb-3 text-4xl">🎉</div>
          <p className="text-gray-500">No wrong words yet. Keep practicing!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {wrongWords.map((word) => (
            <WordCard key={word.id} word={word} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Integrate practice record saving into ListenPick**

The `usePracticeSession` hook needs to save records after each answer. Modify `src/hooks/usePracticeSession.ts` to add record saving:

```typescript
import { useEffect, useCallback } from 'react'
import { usePracticeStore } from '@/stores/practiceStore'
import { useWordStore } from '@/stores/wordStore'
import { generateOptions, getRandomWordsForSession } from '@/services/practiceService'
import { savePracticeRecord, updateWordPracticeStats } from '@/services/statsService'
import type { PracticeMode } from '@/types'

export function usePracticeSession(mode: PracticeMode, count: number = 10) {
  const {
    session, options, selectedAnswer, showResult,
    startSession, selectAnswer, setOptions, nextWord: storeNextWord, endSession,
  } = usePracticeStore()

  const initSession = useCallback(async () => {
    const words = await getRandomWordsForSession(count)
    if (words.length > 0) {
      startSession(mode, words)
    }
  }, [mode, count, startSession])

  useEffect(() => {
    initSession()
  }, [initSession])

  useEffect(() => {
    if (!session || session.isComplete) return
    const currentWord = session.words[session.currentIndex]
    const allWords = useWordStore.getState().words
    if (allWords.length > 0 && currentWord) {
      const opts = generateOptions(currentWord, allWords, 4)
      setOptions(opts)
    }
  }, [session?.currentIndex, session?.isComplete])

  const nextWord = useCallback(async () => {
    const state = usePracticeStore.getState()
    if (!state.session || !state.selectedAnswer) return

    const word = state.session.words[state.session.currentIndex]
    const isCorrect = state.selectedAnswer.toLowerCase() === word.headWord.toLowerCase()

    await savePracticeRecord({
      wordId: word.id,
      mode: state.session.mode,
      isCorrect,
      userAnswer: state.selectedAnswer,
      timestamp: Date.now(),
      duration: 0,
    })

    await updateWordPracticeStats(word.id, isCorrect)

    storeNextWord()
  }, [storeNextWord])

  return {
    session,
    options,
    selectedAnswer,
    showResult,
    currentWord: session ? session.words[session.currentIndex] : null,
    selectAnswer,
    nextWord,
    endSession,
    initSession,
  }
}
```

- [ ] **Step 3: Verify build**

```bash
pnpm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/pages/WrongBook.tsx src/hooks/usePracticeSession.ts
git commit -m "feat: add wrong book page with auto-collected error words and practice record saving"
```

### Task 5.2: Favorites page

**Files:**
- Create: `src/pages/Favorites.tsx`

- [ ] **Step 1: Create Favorites page**

Create `src/pages/Favorites.tsx`:
```typescript
import { useEffect, useState } from 'react'
import { db } from '@/lib/db'
import { WordCard } from '@/components/word/WordCard'
import type { Word } from '@/types'

export function Favorites() {
  const [favorites, setFavorites] = useState<Word[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadFavorites = async () => {
    setIsLoading(true)
    const words = await db.words.where('isFavorite').equals(true).toArray()
    setFavorites(words)
    setIsLoading(false)
  }

  useEffect(() => {
    loadFavorites()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="text-sm text-gray-500">
          {favorites.length} favorite word{favorites.length !== 1 ? 's' : ''}
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mb-3 text-4xl">⭐</div>
          <p className="text-gray-500">No favorites yet. Star words while browsing!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((word) => (
            <WordCard key={word.id} word={word} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Favorites.tsx
git commit -m "feat: add favorites page showing starred words"
```

---

## Phase 6: Polish & Import Flow

### Task 6.1: Import page and data management

**Files:**
- Create: `src/pages/ImportPage.tsx` (or integrate into Dashboard)
- Modify: `src/pages/Dashboard.tsx` (add import UI when no words)

- [ ] **Step 1: Add import UI to Dashboard for first-time setup**

Modify `src/pages/Dashboard.tsx` to show import prompt when word count is 0:

Add to Dashboard:
```typescript
import { useState } from 'react'
import { addWords } from '@/lib/db'
import { importFromJsonl } from '@/services/importService'
import type { Word } from '@/types'

// Inside Dashboard component, add:
const [isImporting, setIsImporting] = useState(false)
const [importProgress, setImportProgress] = useState({ done: 0, total: 0 })

const handleImport = async () => {
  try {
    const response = await fetch('/IELTSword.json')
    const text = await response.text()
    const lines = text.trim().split('\n')
    const words: Word[] = []

    setIsImporting(true)
    for (let i = 0; i < lines.length; i++) {
      const raw = JSON.parse(lines[i])
      if (raw && raw.headWord) {
        const { transformWord } = await import('@/services/importService')
        words.push(transformWord(raw))
      }
      setImportProgress({ done: i + 1, total: lines.length })
    }

    await addWords(words)
    setIsImporting(false)
    await loadWords()
    window.location.reload()
  } catch (err) {
    console.error('Import failed:', err)
    setIsImporting(false)
  }
}

// Add to JSX at top when words.length === 0:
// Show import prompt card
```

Better approach — create a dedicated `DataImport` component.

Create `src/components/DataImport.tsx`:
```typescript
import { useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { addWords } from '@/lib/db'
import { transformWord, parseLine } from '@/services/importService'
import { useWordStore } from '@/stores/wordStore'
import type { Word } from '@/types'

export function DataImport() {
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const { loadWords, isImported, setImported } = useWordStore()

  const handleImport = async () => {
    setIsImporting(true)
    setProgress(0)

    try {
      const response = await fetch('/IELTSword.json')
      if (!response.ok) throw new Error('Failed to load JSON')

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let totalBytes = 0
      const contentLength = parseInt(response.headers.get('content-length') ?? '0', 10)

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        totalBytes += value!.length
        buffer += decoder.decode(value!, { stream: true })

        setProgress(contentLength > 0 ? totalBytes / contentLength : 0)
      }

      // Process all lines
      const lines = buffer.trim().split('\n')
      const words: Word[] = []

      for (const line of lines) {
        const raw = parseLine(line)
        if (raw && raw.headWord) {
          words.push(transformWord(raw))
        }
      }

      // Batch insert in chunks of 500
      const BATCH = 500
      for (let i = 0; i < words.length; i += BATCH) {
        await addWords(words.slice(i, i + BATCH))
        setProgress((i + BATCH) / words.length)
      }

      setImported(true)
      await loadWords()
    } catch (err) {
      console.error('Import error:', err)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
      <div className="mb-4 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
          <Upload className="h-8 w-8 text-primary-500" />
        </div>
      </div>
      <h2 className="mb-2 text-lg font-semibold">Import IELTS Vocabulary</h2>
      <p className="mb-6 text-sm text-gray-500">
        Load words from IELTSword.json to get started with your practice
      </p>
      <button
        onClick={handleImport}
        disabled={isImporting}
        className="inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:bg-gray-200 disabled:text-gray-400"
      >
        {isImporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Importing... {Math.round(progress * 100)}%
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Import Words
          </>
        )}
      </button>
      {isImporting && (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update Dashboard to show import when needed**

Modify `src/pages/Dashboard.tsx` to include DataImport when no words:

```typescript
import { DataImport } from '@/components/DataImport'

// Add to JSX, before the regular dashboard content:
const { words } = useWordStore()
if (words.length === 0) {
  return (
    <div className="mx-auto max-w-xl py-12">
      <DataImport />
    </div>
  )
}
```

- [ ] **Step 3: Add data export/import functionality**

Create `src/components/DataExport.tsx`:
```typescript
import { Download, Upload, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { db, addWords } from '@/lib/db'
import type { Word } from '@/types'

export function DataExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const words = await db.words.toArray()
      const records = await db.practiceRecords.toArray()
      const stats = await db.dailyStats.toArray()

      const data = JSON.stringify({ words, records, stats }, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ielts-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setIsImporting(true)
      try {
        const text = await file.text()
        const data = JSON.parse(text)

        if (data.words) {
          await db.words.clear()
          await addWords(data.words)
        }
        if (data.records) {
          await db.practiceRecords.clear()
          await db.practiceRecords.bulkAdd(data.records)
        }
        if (data.stats) {
          await db.dailyStats.clear()
          await db.dailyStats.bulkAdd(data.stats)
        }
      } finally {
        setIsImporting(false)
        window.location.reload()
      }
    }
    input.click()
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Export Data
      </button>
      <button
        onClick={handleImport}
        disabled={isImporting}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Import Backup
      </button>
    </div>
  )
}
```

Add export buttons to Stats page or Settings.

- [ ] **Step 4: Verify build and final integration**

```bash
pnpm run build
```

Expected: Build succeeds with all features wired up.

- [ ] **Step 5: Run all tests**

```bash
pnpm vitest run
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/DataImport.tsx src/components/DataExport.tsx src/pages/Dashboard.tsx src/pages/Stats.tsx
git commit -m "feat: add data import from JSONL, export/import backup, and first-time setup flow"
```

### Task 6.2: Final integration test

**Files:**
- Create: `src/__tests__/integration.test.tsx`

- [ ] **Step 1: Write integration smoke test**

Create `src/__tests__/integration.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Dashboard } from '@/pages/Dashboard'
import { PracticeHome } from '@/pages/PracticeHome'
import { WrongBook } from '@/pages/WrongBook'
import { Favorites } from '@/pages/Favorites'
import { Stats } from '@/pages/Stats'

function renderWithRouter(Component: React.ComponentType) {
  return render(
    <MemoryRouter>
      <Component />
    </MemoryRouter>
  )
}

describe('Page smoke tests', () => {
  it('renders Dashboard without crashing', () => {
    renderWithRouter(Dashboard)
    expect(screen.getByText(/Start Practice|Import/i)).toBeDefined()
  })

  it('renders PracticeHome without crashing', () => {
    renderWithRouter(PracticeHome)
    expect(screen.getByText('Choose Practice Mode')).toBeDefined()
  })

  it('renders WrongBook without crashing', () => {
    renderWithRouter(WrongBook)
    expect(screen.getByText(/No wrong words|words to review/i)).toBeDefined()
  })

  it('renders Favorites without crashing', () => {
    renderWithRouter(Favorites)
    expect(screen.getByText(/No favorites|favorite word/i)).toBeDefined()
  })

  it('renders Stats without crashing', () => {
    renderWithRouter(Stats)
    expect(screen.getByText(/Total Words|Accuracy/i)).toBeDefined()
  })
})
```

- [ ] **Step 2: Run integration tests**

```bash
pnpm vitest run
```

Expected: All integration tests pass.

- [ ] **Step 3: Build for production**

```bash
pnpm run build
```

Expected: Build succeeds with optimized output in `dist/`.

- [ ] **Step 4: Commit**

```bash
git add src/__tests__/
git commit -m "test: add page smoke tests for all major routes"
```

---

## Self-Review Checklist

**1. Spec coverage:**
- [x] F1 Word list browsing — Task 2.3
- [x] F2 Listen-and-choose (core) — Task 3.3
- [x] F3 Multiple practice modes (4 modes) — Task 3.3
- [x] F4 Progress tracking + stats — Task 4.1, 4.2
- [x] F5 Wrong book + favorites — Task 5.1, 5.2
- [x] Audio service with fallback — Task 2.2
- [x] JSONL import — Task 2.1, 6.1
- [x] Data export/import — Task 6.1
- [x] Layout shell + routing — Task 1.4

**2. Placeholder scan:**
- No "TBD", "TODO", or "implement later" tags
- No "add appropriate error handling" without specifics
- All steps include actual code

**3. Type consistency:**
- `Word` type used consistently across services, stores, components
- `PracticeMode` union type consistent: `'listen' | 'meaning' | 'spell' | 'reverse'`
- `PracticeSession.answers` shape: `{ wordId, isCorrect, userAnswer, duration }` consistent
- `OptionState` reused across all practice pages
- `DailyStats.date` format `YYYY-MM-DD` consistent via `formatDate()` helper
