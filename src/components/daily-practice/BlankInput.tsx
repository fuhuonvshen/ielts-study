import { useRef, useEffect, useCallback } from 'react'

export type BlankState = 'empty' | 'filled' | 'correct' | 'incorrect'

interface Props {
  blankId: number
  value: string
  width: number
  onChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  disabled: boolean
  state: BlankState
  correctAnswer?: string
  onRef?: (el: HTMLInputElement | null) => void
}

const stateStyles: Record<BlankState, string> = {
  empty: 'border-gray-300 bg-transparent focus:border-primary-400',
  filled: 'border-gray-400 bg-transparent focus:border-primary-400',
  correct: 'border-success-400 bg-success-50 text-success-700',
  incorrect: 'border-danger-400 bg-danger-50 text-danger-700',
}

export function BlankInput({ blankId, value, width, onChange, onKeyDown, disabled, state, correctAnswer, onRef }: Props) {
  const innerRef = useRef<HTMLInputElement | null>(null)

  const setRef = useCallback((el: HTMLInputElement | null) => {
    innerRef.current = el
    onRef?.(el)
  }, [onRef])

  useEffect(() => {
    if (state === 'incorrect' && innerRef.current) {
      innerRef.current.focus()
      innerRef.current.select()
    }
  }, [state])

  return (
    <span className="relative inline-flex flex-col items-center mx-0.5">
      <input
        ref={setRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        data-blank-id={blankId}
        className={`border-b-2 bg-transparent text-center text-base font-medium outline-none transition-colors ${stateStyles[state]}`}
        style={{ width: `${Math.max(width, 64)}px` }}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />
      {state === 'incorrect' && correctAnswer && (
        <span className="absolute -bottom-5 text-xs text-success-600 font-medium whitespace-nowrap">{correctAnswer}</span>
      )}
    </span>
  )
}
