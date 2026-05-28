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
  const records = await db.practiceRecords.filter((r) => !r.isCorrect).toArray()
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
