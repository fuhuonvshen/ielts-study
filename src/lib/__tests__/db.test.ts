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
