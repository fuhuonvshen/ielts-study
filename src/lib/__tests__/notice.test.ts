import { describe, it, expect, beforeEach } from 'vitest'
import { shouldShowNotice, markNoticeSeen, muteNoticeForWeek } from '../notice'

const day = (d: number, hour = 10) => new Date(2026, 8, d, hour, 0, 0)

describe('shouldShowNotice', () => {
  beforeEach(() => localStorage.clear())

  it('shows when nothing has been stored', () => {
    expect(shouldShowNotice(day(20))).toBe(true)
  })

  it('hides for the rest of the day once seen', () => {
    markNoticeSeen(day(20))
    expect(shouldShowNotice(day(20, 23))).toBe(false)
  })

  it('shows again the next day', () => {
    markNoticeSeen(day(20))
    expect(shouldShowNotice(day(21))).toBe(true)
  })

  it('stays hidden while muted', () => {
    muteNoticeForWeek(day(20))
    expect(shouldShowNotice(day(21))).toBe(false)
    expect(shouldShowNotice(day(26))).toBe(false)
  })

  it('shows again after the mute week expires', () => {
    muteNoticeForWeek(day(20))
    expect(shouldShowNotice(day(28))).toBe(true)
  })

  it('ignores a corrupted mute value', () => {
    localStorage.setItem('feedback-notice-muted-until', 'not-a-number')
    expect(shouldShowNotice(day(20))).toBe(true)
  })
})
