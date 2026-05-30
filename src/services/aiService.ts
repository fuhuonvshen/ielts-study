import type { Word, PersonaId, AiAnalysisContent } from '@/types'
import { PERSONAS } from '@/types'

const API_MODEL = 'deepseek-chat'

function getApiUrl(): string {
  const proxy = import.meta.env.VITE_AI_PROXY as string | undefined
  if (proxy) return `${proxy}/v1/chat/completions`
  // Dev: use Vite proxy
  return '/api/deepseek/v1/chat/completions'
}

function getApiKey(): string | undefined {
  return import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const apiKey = getApiKey()
  if (!apiKey) return headers
  const proxy = import.meta.env.VITE_AI_PROXY as string | undefined
  // Worker 代理用 X-Api-Key；本地 Vite 代理用 Authorization
  if (proxy) {
    headers['X-Api-Key'] = apiKey
  } else {
    headers['Authorization'] = `Bearer ${apiKey}`
  }
  return headers
}

function buildWordData(word: Word) {
  return {
    headWord: word.headWord,
    translations: word.translations.map((t) => ({
      pos: t.pos,
      chinese: t.tranCn,
      english: t.tranOther,
    })),
    sentences: word.sentences.slice(0, 3).map((s) => ({
      en: s.en,
      cn: s.cn,
    })),
    synonyms: word.synonyms.map((s) => ({
      pos: s.pos,
      words: s.words,
    })),
    phrases: word.phrases.slice(0, 3).map((p) => ({
      en: p.en,
      cn: p.cn,
    })),
  }
}

export async function analyzeWord(
  word: Word,
  personaId: PersonaId
): Promise<AiAnalysisContent> {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('No API key configured')

  const persona = PERSONAS.find((p) => p.id === personaId)
  if (!persona) throw new Error(`Unknown persona: ${personaId}`)

  const wordData = buildWordData(word)
  const url = getApiUrl()

  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({
      model: API_MODEL,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: persona.systemPrompt },
        {
          role: 'user',
          content: `Analyze the following IELTS word and return a JSON object with 4 fields:\n\n${JSON.stringify(wordData, null, 2)}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(`API error ${response.status}: ${errorBody.slice(0, 200)}`)
  }

  const data = await response.json()
  const text: string = data.choices?.[0]?.message?.content ?? ''
  if (!text) throw new Error('Empty response from API')

  // Extract JSON from response (handle possible markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in response')

  const parsed = JSON.parse(jsonMatch[0]) as AiAnalysisContent
  if (!parsed.memoryTip && !parsed.synonymDifferentiation && !parsed.usageNote && !parsed.interestingFact) {
    throw new Error('Response missing required fields')
  }

  return {
    memoryTip: parsed.memoryTip ?? '',
    synonymDifferentiation: parsed.synonymDifferentiation ?? '',
    usageNote: parsed.usageNote ?? '',
    interestingFact: parsed.interestingFact ?? '',
  }
}

export async function analyzePronunciation(word: string): Promise<string> {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('No API key configured')

  const url = getApiUrl()

  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({
      model: API_MODEL,
      max_tokens: 512,
      messages: [
        {
          role: 'system',
          content: `你是一位专业的英语发音教练，精通音标、连读、弱读、重音等发音技巧。你的任务是纯发音教学。

重要规则：
- 绝对不要在回复中写出这个单词的拼写，用户正在做听力练习，不能看到单词
- 可以用音标，但不要写单词本身
- 不要提及单词的中文意思、英文释义、用法、例句、词性等任何与词义相关的内容
- 只专注于发音教学：音标拆解、音节划分、重音位置、连读规则、弱读现象、易错发音点
- 用中文讲解，音标用英文
- 回复控制在150字以内，简洁实用`,
        },
        {
          role: 'user',
          content: `请教我如何正确发音这个单词："${word}"。只讲发音，不要写出单词拼写，不讲意思。`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(`API error ${response.status}: ${errorBody.slice(0, 200)}`)
  }

  const data = await response.json()
  const text: string = data.choices?.[0]?.message?.content ?? ''
  if (!text) throw new Error('Empty response from API')

  return text
}
