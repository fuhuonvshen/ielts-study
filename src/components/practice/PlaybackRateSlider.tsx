import { Gauge } from 'lucide-react'
import { usePracticeStore, type PlaybackRate } from '@/stores/practiceStore'

const rates: { value: PlaybackRate; label: string }[] = [
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x' },
]

export function PlaybackRateSlider() {
  const { playbackRate, setPlaybackRate } = usePracticeStore()

  return (
    <div className="hidden sm:flex items-center gap-1 rounded-lg bg-gray-100 p-0.5">
      <Gauge className="ml-1 h-3.5 w-3.5 text-gray-400" />
      {rates.map((r) => {
        const isActive = playbackRate === r.value
        return (
          <button
            key={r.value}
            onClick={() => setPlaybackRate(r.value)}
            className={`rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
              isActive
                ? 'bg-white text-gray-700 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {r.label}
          </button>
        )
      })}
    </div>
  )
}
