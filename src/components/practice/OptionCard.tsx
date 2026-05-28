import { cn } from '@/lib/utils'

export type OptionState = 'idle' | 'selected' | 'correct' | 'incorrect'

interface OptionCardProps {
  text: React.ReactNode
  state: OptionState
  onClick: () => void
  disabled?: boolean
  showIcon?: boolean
}

export function OptionCard({ text, state, onClick, disabled = false, showIcon = false }: OptionCardProps) {
  const stateStyles: Record<OptionState, string> = {
    idle: 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50',
    selected: 'border-primary-300 bg-primary-50 ring-1 ring-primary-200',
    correct: 'border-success-500 bg-success-50 ring-1 ring-success-200',
    incorrect: 'border-danger-500 bg-danger-50 ring-1 ring-danger-200',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || state !== 'idle'}
      className={cn(
        'relative w-full rounded-2xl border-2 p-5 text-left transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
        'disabled:cursor-default',
        stateStyles[state]
      )}
    >
      <span className="text-base font-medium text-gray-800">{text}</span>
      {showIcon && state === 'correct' && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-success-500 text-lg">&#10003;</span>
      )}
      {showIcon && state === 'incorrect' && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-danger-500 text-lg">&#10007;</span>
      )}
    </button>
  )
}
