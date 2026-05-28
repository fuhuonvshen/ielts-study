import { describe, it, expect } from 'vitest'
import { cn, shuffle, pickRandom, formatDate, formatAccuracy } from '../utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
    expect(cn('a', false && 'b', 'c')).toBe('a c')
  })
})

describe('shuffle', () => {
  it('returns array of same length', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(shuffle(arr)).toHaveLength(5)
  })
  it('contains same elements', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(shuffle(arr).sort()).toEqual([1, 2, 3, 4, 5])
  })
})

describe('pickRandom', () => {
  it('picks n elements', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    expect(pickRandom(arr, 3)).toHaveLength(3)
  })
  it('does not include excluded element', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = pickRandom(arr, 4, 3)
    expect(result).not.toContain(3)
    expect(result).toHaveLength(4)
  })
})

describe('formatDate', () => {
  it('formats date to YYYY-MM-DD', () => {
    expect(formatDate(new Date('2026-05-28'))).toBe('2026-05-28')
  })
})

describe('formatAccuracy', () => {
  it('formats accuracy as percentage', () => {
    expect(formatAccuracy(7, 10)).toBe('70%')
    expect(formatAccuracy(0, 0)).toBe('0%')
  })
})
