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

  it('handles missing optional fields gracefully', () => {
    const minimal: RawWordData = {
      wordRank: 1,
      headWord: 'test',
      bookId: 'TEST',
      content: {
        word: {
          wordHead: 'test',
          wordId: 'TEST_1',
          content: {},
        },
      },
    }
    const word = transformWord(minimal)
    expect(word.id).toBe('TEST_1')
    expect(word.translations).toEqual([])
    expect(word.sentences).toEqual([])
    expect(word.synonyms).toEqual([])
    expect(word.phrases).toEqual([])
    expect(word.relWords).toEqual([])
  })
})
