import { useNavigate } from 'react-router-dom'
import { Volume2, BookOpen, Pencil, ArrowLeftRight } from 'lucide-react'

const modes = [
  {
    key: 'listen',
    title: 'Listen & Pick',
    description: 'Listen to the word and choose the correct spelling',
    icon: Volume2,
    color: 'bg-primary-50 text-primary-600',
  },
  {
    key: 'meaning',
    title: 'Word → Meaning',
    description: 'See the word and choose the correct Chinese meaning',
    icon: BookOpen,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    key: 'spell',
    title: 'Listen & Spell',
    description: 'Listen to the word and type the correct spelling',
    icon: Pencil,
    color: 'bg-orange-50 text-orange-600',
  },
  {
    key: 'reverse',
    title: 'Meaning → Word',
    description: 'See the Chinese meaning and choose the correct word',
    icon: ArrowLeftRight,
    color: 'bg-green-50 text-green-600',
  },
]

export function PracticeHome() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-6 text-xl font-semibold">Choose Practice Mode</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {modes.map(({ key, title, description, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => navigate(`/practice/${key}`)}
            className="group rounded-2xl border border-gray-100 bg-white p-6 text-left transition-all duration-200 hover:shadow-lg hover:shadow-gray-100"
          >
            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mb-1 text-base font-semibold">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
