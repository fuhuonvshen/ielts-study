import type { Word } from '@/types'
import { shuffle, pickRandom } from '@/lib/utils'
import { getAllWords } from '@/lib/db'

export function generateOptions(correctWord: Word, allWords: Word[], count: number = 4): Word[] {
  const samePos = correctWord.translations[0]?.pos
  let pool = allWords.filter((w) => w.id !== correctWord.id)

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
