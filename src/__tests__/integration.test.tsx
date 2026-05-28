import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PracticeHome } from '@/pages/PracticeHome'

function renderWithRouter(Component: React.ComponentType) {
  return render(
    <MemoryRouter>
      <Component />
    </MemoryRouter>
  )
}

describe('Page smoke tests', () => {
  it('renders PracticeHome without crashing', () => {
    renderWithRouter(PracticeHome)
    expect(screen.getByText('Choose Practice Mode')).toBeDefined()
  })
})
