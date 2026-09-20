import { describe, it, expect } from 'vitest'
import { buildFeedbackText, isValidEmail } from '../feedbackService'

describe('isValidEmail', () => {
  it('accepts ordinary addresses', () => {
    expect(isValidEmail('someone@example.com')).toBe(true)
    expect(isValidEmail('  someone@example.com  ')).toBe(true)
  })

  it('rejects malformed addresses', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('someone')).toBe(false)
    expect(isValidEmail('someone@example')).toBe(false)
    expect(isValidEmail('some one@example.com')).toBe(false)
  })
})

describe('buildFeedbackText', () => {
  it('keeps the keyword the Feishu bot is configured to require', () => {
    const text = buildFeedbackText('想要生词本导出', 'someone@example.com', new Date(2026, 8, 20, 19, 5))
    expect(text.startsWith('雅思小站反馈')).toBe(true)
  })

  it('carries the reply address and the message body', () => {
    const text = buildFeedbackText('  想要生词本导出  ', ' someone@example.com ', new Date(2026, 8, 20, 19, 5))
    expect(text).toContain('邮箱：someone@example.com')
    expect(text.endsWith('想要生词本导出')).toBe(true)
  })
})
