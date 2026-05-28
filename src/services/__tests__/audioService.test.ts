import { describe, it, expect } from 'vitest'
import { buildYoudaoUrl, supportsSpeechSynthesis } from '../audioService'

describe('buildYoudaoUrl', () => {
  it('builds US pronunciation URL', () => {
    const url = buildYoudaoUrl('cancel', 'us')
    expect(url).toBe('https://dict.youdao.com/dictvoice?audio=cancel&type=2')
  })

  it('builds UK pronunciation URL', () => {
    const url = buildYoudaoUrl('cancel', 'uk')
    expect(url).toBe('https://dict.youdao.com/dictvoice?audio=cancel&type=1')
  })
})

describe('supportsSpeechSynthesis', () => {
  it('returns boolean', () => {
    expect(typeof supportsSpeechSynthesis()).toBe('boolean')
  })
})
