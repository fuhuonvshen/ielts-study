import { parseLine, transformWord } from '../services/importService'
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
