import { LayoutPanelLeft, PanelLeft, PanelRight } from 'lucide-react'
import { usePracticeStore, type LayoutRatio } from '@/stores/practiceStore'

const ratios: { value: LayoutRatio; label: string }[] = [
  { value: 0.5, label: '1:2' },
  { value: 1, label: '1:1' },
  { value: 2, label: '2:1' },
]

export function LayoutRatioSlider() {
  const { layoutRatio, setLayoutRatio } = usePracticeStore()

  return (
    <div className="hidden sm:flex items-center gap-1 rounded-lg bg-gray-100 p-0.5">
      {ratios.map((r) => {
        const isActive = layoutRatio === r.value
        return (
          <button
            key={r.value}
            onClick={() => setLayoutRatio(r.value)}
            title={`Left:Right = ${r.label}`}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
              isActive
                ? 'bg-white text-gray-700 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {r.value === 0.5 ? <PanelRight className="h-3.5 w-3.5" /> :
             r.value === 1 ? <PanelLeft className="h-3.5 w-3.5" /> :
             <LayoutPanelLeft className="h-3.5 w-3.5" />}
            {r.label}
          </button>
        )
      })}
    </div>
  )
}
