import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OptionCard } from '../OptionCard'

describe('OptionCard', () => {
  it('renders the option text', () => {
    render(<OptionCard text="cancel" state="idle" onClick={() => {}} />)
    expect(screen.getByText('cancel')).toBeInTheDocument()
  })

  it('calls onClick when clicked and not disabled', () => {
    const onClick = vi.fn()
    render(<OptionCard text="cancel" state="idle" onClick={onClick} />)
    fireEvent.click(screen.getByText('cancel'))
    expect(onClick).toHaveBeenCalled()
  })

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn()
    render(<OptionCard text="cancel" state="idle" onClick={onClick} disabled />)
    fireEvent.click(screen.getByText('cancel'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('applies correct styles for correct state', () => {
    render(<OptionCard text="cancel" state="correct" onClick={() => {}} />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('border-success-500')
  })

  it('applies correct styles for incorrect state', () => {
    render(<OptionCard text="cancel" state="incorrect" onClick={() => {}} />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('border-danger-500')
  })
})
