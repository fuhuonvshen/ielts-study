import { useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react'
import { isValidEmail, sendFeedback } from '@/services/feedbackService'

const inputClass =
  'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-primary-300 focus:ring-2 focus:ring-primary-50'
const labelClass = 'mb-2 block text-sm font-medium text-gray-700'

export function Feedback() {
  const [content, setContent] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle')
  const [error, setError] = useState('')

  const emailFilled = email.trim().length > 0
  const emailValid = isValidEmail(email)
  const canSubmit = content.trim().length > 0 && emailValid && status !== 'sending'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setError('')
    setStatus('sending')
    try {
      await sendFeedback(content, email)
      setContent('')
      setEmail('')
      setStatus('success')
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : '发送失败，请稍后再试')
    }
  }

  if (status === 'success') {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
          <CheckCircle2 className="mx-auto h-9 w-9 text-success-500" />
          <h2 className="mt-4 text-lg font-semibold tracking-tight">收到了，谢谢你</h2>
          <p className="mt-2 text-sm text-gray-500">我会看到这条消息，需要跟进的话会回信给你。</p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-6 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            再写一条
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6">
        <div>
          <label htmlFor="feedback-content" className={labelClass}>
            你想说点什么
          </label>
          <textarea
            id="feedback-content"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="想要什么功能、哪里不好用、哪个单词的释义有问题……都可以写在这里。"
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label htmlFor="feedback-email" className={labelClass}>
            你的邮箱
          </label>
          <input
            id="feedback-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
          <p className="mt-2 text-xs text-gray-400">
            仅用于回复你，不会用于其他用途，也不会给到第三方。
          </p>
          {emailFilled && !emailValid && (
            <p className="mt-1 text-xs text-danger-600">邮箱格式看起来不太对</p>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-danger-50 bg-danger-50 px-4 py-3 text-sm text-danger-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 active:scale-[0.99] disabled:bg-gray-200 disabled:text-gray-400"
        >
          {status === 'sending' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> 发送中…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> 发送
            </>
          )}
        </button>
      </form>
    </div>
  )
}
