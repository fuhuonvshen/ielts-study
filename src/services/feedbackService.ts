const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const COOLDOWN_KEY = 'feedback-last-sent-at'
const COOLDOWN_MS = 60_000

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim())
}

function formatTimestamp(now: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now)
}

export function buildFeedbackText(content: string, email: string, now: Date): string {
  return [
    // 固定开头，与飞书机器人「自定义关键词」安全设置对应，改动需同步后台配置
    '雅思小站反馈',
    `邮箱：${email.trim()}`,
    `时间：${formatTimestamp(now)}`,
    '',
    '内容：',
    content.trim(),
  ].join('\n')
}

function cooldownRemainingMs(now: number): number {
  try {
    const last = Number(localStorage.getItem(COOLDOWN_KEY))
    if (!Number.isFinite(last)) return 0
    return Math.max(0, COOLDOWN_MS - (now - last))
  } catch {
    return 0
  }
}

function markSent(now: number): void {
  try {
    localStorage.setItem(COOLDOWN_KEY, String(now))
  } catch {
    /* ignore */
  }
}

export async function sendFeedback(content: string, email: string): Promise<void> {
  const webhook = import.meta.env.VITE_FEISHU_WEBHOOK as string | undefined
  if (!webhook) throw new Error('反馈通道未配置，请稍后再试')

  const now = Date.now()
  if (cooldownRemainingMs(now) > 0) throw new Error('刚提交过一次，请稍等一分钟再发')

  const response = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      msg_type: 'text',
      content: { text: buildFeedbackText(content, email, new Date(now)) },
    }),
  })

  const data = await response.json().catch(() => null)
  if (!response.ok || data?.code !== 0) {
    throw new Error(data?.msg || `发送失败（HTTP ${response.status}）`)
  }

  markSent(now)
}
