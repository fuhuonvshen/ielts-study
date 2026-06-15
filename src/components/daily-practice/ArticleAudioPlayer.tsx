import { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'

const RATES = [0.75, 1, 1.25, 1.5]
const DATA_BASE = '/data/daily-practice'

interface Props {
  audioFile: string
  title: string
}

export function ArticleAudioPlayer({ audioFile, title }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [rate, setRate] = useState(1)

  const src = `${DATA_BASE}/${audioFile}`

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onTime = () => setCurrentTime(el.currentTime)
    const onLoaded = () => setDuration(el.duration)
    const onEnd = () => setPlaying(false)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onLoaded)
    el.addEventListener('ended', onEnd)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onLoaded)
      el.removeEventListener('ended', onEnd)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
    }
  }, [src])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate
    }
  }, [rate])

  const togglePlay = () => {
    const el = audioRef.current
    if (!el) return
    if (el.paused) el.play()
    else el.pause()
  }

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value)
    setCurrentTime(t)
    if (audioRef.current) audioRef.current.currentTime = t
  }

  const skip = (sec: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(Math.max(audioRef.current.currentTime + sec, 0), duration)
    }
  }

  const fmt = (t: number) => {
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <audio ref={audioRef} src={src} preload="metadata" />
      <p className="mb-3 text-xs text-gray-400 truncate">{title}</p>
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => skip(-10)} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
          <SkipBack className="h-4 w-4" />
        </button>
        <button
          onClick={togglePlay}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors"
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </button>
        <button onClick={() => skip(10)} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
          <SkipForward className="h-4 w-4" />
        </button>
        <div className="flex-1 mx-2">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={seek}
            className="w-full h-1.5 rounded-full bg-gray-100 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500"
            style={{ background: `linear-gradient(to right, #3b82f6 ${progress}%, #f1f5f9 ${progress}%)` }}
          />
        </div>
        <span className="text-xs text-gray-400 w-16 text-right tabular-nums">{fmt(currentTime)} / {fmt(duration)}</span>
      </div>
      <div className="flex items-center gap-1">
        {RATES.map((r) => (
          <button
            key={r}
            onClick={() => setRate(r)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              rate === r ? 'bg-primary-100 text-primary-700' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {r}x
          </button>
        ))}
      </div>
    </div>
  )
}
