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
