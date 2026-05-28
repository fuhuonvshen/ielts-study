export type Accent = 'us' | 'uk'

export function buildYoudaoUrl(word: string, accent: Accent): string {
  const type = accent === 'us' ? '2' : '1'
  return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=${type}`
}

export function supportsSpeechSynthesis(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speakWithWebSpeech(text: string, accent: Accent): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!supportsSpeechSynthesis()) {
      reject(new Error('Speech synthesis not supported'))
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = accent === 'us' ? 'en-US' : 'en-GB'
    utterance.rate = 0.9
    utterance.onend = () => resolve()
    utterance.onerror = () => reject(new Error('Speech synthesis failed'))
    speechSynthesis.cancel()
    speechSynthesis.speak(utterance)
  })
}

let currentAudio: HTMLAudioElement | null = null

export function stopAllAudio(): void {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.src = ''
    currentAudio = null
  }
  if (supportsSpeechSynthesis()) {
    speechSynthesis.cancel()
  }
}

export function playAudio(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    stopAllAudio()
    const audio = new Audio(url)
    currentAudio = audio
    audio.onended = () => { currentAudio = null; resolve() }
    audio.onerror = () => { currentAudio = null; reject(new Error('Audio playback failed')) }
    audio.play().catch((e) => { currentAudio = null; reject(e) })
  })
}

export async function speakWord(word: string, accent: Accent): Promise<void> {
  try {
    const url = buildYoudaoUrl(word, accent)
    await playAudio(url)
  } catch {
    try {
      await speakWithWebSpeech(word, accent)
    } catch {
      // Both methods failed — silently ignore
    }
  }
}
