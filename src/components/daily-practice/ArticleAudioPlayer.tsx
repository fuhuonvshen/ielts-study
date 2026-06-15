import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'

const RATES = [0.75, 1, 1.25, 1.5]

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
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load voices
  useEffect(() => {
    const load = () => {
      const all = speechSynthesis.getVoices()
      const en = all.filter((v) => v.lang.startsWith('en'))
      if (en.length > 0) {
        setVoices(en)
        // Prefer UK female
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

  // Estimate duration based on text length and rate
  const estDuration = Math.ceil((text.split(/\s+/).length / 150) * 60 / rate)

  const stop = useCallback(() => {
    speechSynthesis.cancel()
    setPlaying(false)
    setCurrentTime(0)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speechSynthesis.cancel()
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const play = () => {
    speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = rate
    utter.lang = 'en-GB'
    if (voices[voiceIdx]) utter.voice = voices[voiceIdx]

    setDuration(estDuration)
    setCurrentTime(0)

    const startTime = Date.now()
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      setCurrentTime(Math.min(elapsed, estDuration))
    }, 200)

    utter.onend = () => {
      setPlaying(false)
      setCurrentTime(estDuration)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    utter.onerror = () => {
      setPlaying(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    utteranceRef.current = utter
    speechSynthesis.speak(utter)
    setPlaying(true)
  }

  const togglePlay = () => {
    if (playing) {
      stop()
    } else {
      play()
    }
  }

  const skip = (sec: number) => {
    stop()
    // Re-play from estimated offset
    const newStart = Math.max(0, Math.min(currentTime + sec, estDuration))
    setCurrentTime(newStart)
    // Since Web Speech API doesn't support seeking, we cancel and re-play
    // For simplicity: just restart. Better implementations would split text.
    play()
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
          <input type="range" min={0} max={duration || 1} value={currentTime} readOnly
            className="w-full h-1.5 rounded-full bg-gray-100 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500"
            style={{ background: `linear-gradient(to right, #3b82f6 ${progress}%, #f1f5f9 ${progress}%)` }}
          />
        </div>
        <span className="text-xs text-gray-400 w-16 text-right tabular-nums">{fmt(currentTime)} / {fmt(duration)}</span>
      </div>
      <div className="flex items-center gap-2 justify-between flex-wrap">
        <div className="flex items-center gap-1">
          {RATES.map((r) => (
            <button key={r} onClick={() => { setRate(r); stop() }}
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
            onChange={(e) => { setVoiceIdx(Number(e.target.value)); stop() }}
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
