import { Type } from 'lucide-react'
import { usePracticeStore, type ContentScale } from '@/stores/practiceStore'

const scales: { value: ContentScale; label: string }[] = [
  { value: 1, label: 'A' },
  { value: 1.15, label: 'A' },
  { value: 1.3, label: 'A' },
]

export function ContentScaleSlider() {
  const { contentScale, setContentScale } = usePracticeStore()

  return (
    <div className="hidden sm:flex items-center gap-1 rounded-lg bg-gray-100 p-0.5">
      <Type className="ml-1 h-3.5 w-3.5 text-gray-400" />
      {scales.map((s, i) => {
        const isActive = contentScale === s.value
        return (
          <button
            key={s.value}
            onClick={() => setContentScale(s.value)}
            title={`Scale: ${Math.round(s.value * 100)}%`}
            className={`rounded-md px-2 py-1.5 font-semibold transition-all ${
              isActive
                ? 'bg-white text-gray-700 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            style={{ fontSize: `${12 * (1 + i * 0.25)}px` }}
          >
            {s.label}
          </button>
        )
      })}
    </div>
  )
}
