import type { DailyPracticeData } from '@/types/dailyPractice'

const BASE = import.meta.env.BASE_URL + 'data/daily-practice/'

/** 可用日期列表，来自爬虫维护的 index.json。 */
export async function fetchArchiveIndex(): Promise<string[]> {
  const res = await fetch(BASE + 'index.json')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  return Array.isArray(json.dates) ? json.dates : []
}

/** 只加载指定那一天的 5 篇文章，不会连带拉取其他日期。 */
export async function fetchDay(date: string): Promise<DailyPracticeData> {
  const res = await fetch(`${BASE}${date}.json`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
