import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'

const RATES = [0.75, 1, 1.25, 1.5]
const WPS = 150 / 60 // words per second at 1x (rough estimate)

interface Props {
  text: string
  title: string
}

export function ArticleAudioPlayer({ text, title }: Props) {
  const [playing, setPlaying] = useState(false)
  const [rate, setRate] = useState(1)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceIdx, setVoiceIdx] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const timerStartRef = useRef(0)
  const timerOffsetRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const words = text.split(/\s+/)
  const estDuration = Math.ceil(words.length / (WPS * rate))

  // Load voices
  useEffect(() => {
    const load = () => {
      const all = speechSynthesis.getVoices()
      const en = all.filter((v) => v.lang.startsWith('en'))
      if (en.length > 0) {
        setVoices(en)
        const ukIdx = en.findIndex((v) => v.lang === 'en-GB' && v.name.includes('Female'))
        if (ukIdx >= 0) setVoiceIdx(ukIdx)
      } else {
        setVoices(all)
      }
    }
    load()
    speechSynthesis.onvoiceschanged = load
    return () => { speechSynthesis.onvoiceschanged = null }
  }, [])

  // Sync estimated duration
  useEffect(() => {
    setDuration(estDuration)
  }, [estDuration])

  // Timer
  const startTimer = useCallback((startFrom: number) => {
    timerStartRef.current = Date.now()
    timerOffsetRef.current = startFrom
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - timerStartRef.current) / 1000
      setCurrentTime(Math.min(timerOffsetRef.current + elapsed, estDuration))
    }, 200)
  }, [estDuration])

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speechSynthesis.cancel()
      clearTimer()
    }
  }, [clearTimer])

  const speakFrom = useCallback((wordIndex: number) => {
    speechSynthesis.cancel()
    clearTimer()

    const startText = words.slice(wordIndex).join(' ')
    if (!startText) return

    const utter = new SpeechSynthesisUtterance(startText)
    utter.rate = rate
    utter.lang = 'en-GB'
    if (voices[voiceIdx]) utter.voice = voices[voiceIdx]

    const startTime = wordIndex / (WPS * rate)

    utter.onstart = () => {
      setPlaying(true)
      startTimer(startTime)
    }
    utter.onend = () => {
      setPlaying(false)
      setCurrentTime(estDuration)
      clearTimer()
    }
    utter.onerror = () => {
      setPlaying(false)
      clearTimer()
    }

    speechSynthesis.speak(utter)
  }, [words, rate, voices, voiceIdx, estDuration, clearTimer, startTimer])

  const play = useCallback(() => {
    if (currentTime >= estDuration - 0.5) {
      // At end, restart from beginning
      const wordIdx = 0
      speakFrom(wordIdx)
    } else {
      // Resume from current position
      const wordIdx = Math.floor((currentTime / estDuration) * words.length)
      speakFrom(Math.max(0, wordIdx))
    }
  }, [currentTime, estDuration, words.length, speakFrom])

  const pause = useCallback(() => {
    speechSynthesis.pause()
    setPlaying(false)
    clearTimer()
  }, [clearTimer])

  const resume = useCallback(() => {
    speechSynthesis.resume()
    setPlaying(true)
    startTimer(currentTime)
  }, [currentTime, startTimer])

  const togglePlay = () => {
    if (playing) {
      pause()
    } else if (speechSynthesis.paused) {
      resume()
    } else {
      play()
    }
  }

  const commitSeek = () => {
    const wordIdx = Math.floor((currentTime / estDuration) * words.length)
    speakFrom(Math.max(0, wordIdx))
  }

  const skip = (sec: number) => {
    const newTime = Math.max(0, Math.min(currentTime + sec, estDuration))
    setCurrentTime(newTime)
    const wordIdx = Math.floor((newTime / estDuration) * words.length)
    speakFrom(Math.max(0, wordIdx))
  }

  const fmt = (t: number) => {
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <p className="mb-3 text-xs text-gray-400 truncate">{title}</p>
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => skip(-10)} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
          <SkipBack className="h-4 w-4" />
        </button>
        <button onClick={togglePlay}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors">
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </button>
        <button onClick={() => skip(10)} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
          <SkipForward className="h-4 w-4" />
        </button>
        <div className="flex-1 mx-2">
          <input type="range" min={0} max={duration || 1} step={0.1} value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            onMouseUp={commitSeek}
            onTouchEnd={commitSeek}
            className="w-full h-1.5 rounded-full bg-gray-100 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500"
            style={{ background: `linear-gradient(to right, #3b82f6 ${progress}%, #f1f5f9 ${progress}%)` }}
          />
        </div>
        <span className="text-xs text-gray-400 w-16 text-right tabular-nums">{fmt(currentTime)} / {fmt(duration)}</span>
      </div>
      <div className="flex items-center gap-2 justify-between flex-wrap">
        <div className="flex items-center gap-1">
          {RATES.map((r) => (
            <button key={r} onClick={() => {
              setRate(r)
              const t = currentTime
              const idx = Math.floor((t / estDuration) * words.length)
              speakFrom(Math.max(0, idx))
            }}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                rate === r ? 'bg-primary-100 text-primary-700' : 'text-gray-400 hover:text-gray-600'
              }`}>
              {r}x
            </button>
          ))}
        </div>
        {voices.length > 1 && (
          <select
            value={voiceIdx}
            onChange={(e) => {
              setVoiceIdx(Number(e.target.value))
            }}
            className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600 bg-white max-w-[160px] truncate"
          >
            {voices.map((v, i) => (
              <option key={i} value={i}>{v.name} ({v.lang})</option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}
