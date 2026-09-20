import { formatDate } from './utils'

const SEEN_KEY = 'feedback-notice-seen-date'
const MUTE_KEY = 'feedback-notice-muted-until'
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* 存储不可用时（隐私模式等）公告会重复出现，不影响主流程 */
  }
}

export function shouldShowNotice(now: Date): boolean {
  const mutedUntil = Number(read(MUTE_KEY))
  if (Number.isFinite(mutedUntil) && mutedUntil > now.getTime()) return false
  return read(SEEN_KEY) !== formatDate(now)
}

export function markNoticeSeen(now: Date): void {
  write(SEEN_KEY, formatDate(now))
}

export function muteNoticeForWeek(now: Date): void {
  write(MUTE_KEY, String(now.getTime() + WEEK_MS))
}
