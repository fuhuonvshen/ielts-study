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
    set({ todayTotal: today.total, todayCorrect: today.correct, streak, last7Days, isLoading: false })
  },
}))
