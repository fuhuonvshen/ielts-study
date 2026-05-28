import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import type { DailyStats, PracticeRecord, Word } from '@/types'

export async function getTodayStats(): Promise<{ total: number; correct: number; date: string }> {
  const today = formatDate(new Date())
  const start = new Date(today).getTime()
  const end = start + 86400000 - 1
  const records = await db.practiceRecords.where('timestamp').between(start, end).toArray()
  const correct = records.filter((r) => r.isCorrect).length
  return { total: records.length, correct, date: today }
}

export async function getStreak(): Promise<number> {
  const allStats = await db.dailyStats.toArray()
  if (allStats.length === 0) return 0
  const sorted = allStats.sort((a, b) => b.date.localeCompare(a.date))
  let streak = 0
  const today = formatDate(new Date())
  for (let i = 0; i < sorted.length; i++) {
    const expectedDate = new Date(today)
    expectedDate.setDate(expectedDate.getDate() - i)
    const expected = formatDate(expectedDate)
    const match = sorted.find((s) => s.date === expected)
    if (match && match.totalCount > 0) streak++
    else if (i > 0) break
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

export async function updateWordPracticeStats(wordId: string, isCorrect: boolean): Promise<void> {
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
