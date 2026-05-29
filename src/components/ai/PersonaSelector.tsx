import { PERSONAS, type PersonaId } from '@/types'

interface PersonaSelectorProps {
  selected: PersonaId
  onChange: (id: PersonaId) => void
}

export function PersonaSelector({ selected, onChange }: PersonaSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PERSONAS.map((p) => {
        const isActive = selected === p.id
        return (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              isActive
                ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
            title={p.description}
          >
            <span className="text-sm leading-none">{p.emoji}</span>
            {p.name}
          </button>
        )
      })}
    </div>
  )
}
