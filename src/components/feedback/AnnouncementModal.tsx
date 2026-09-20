import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'

interface AnnouncementModalProps {
  onClose: (muted: boolean) => void
}

export function AnnouncementModal({ onClose }: AnnouncementModalProps) {
  const navigate = useNavigate()
  const [muted, setMuted] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fade-in bg-black/30 backdrop-blur-sm" />
      <div className="relative w-full max-w-md animate-slide-up rounded-3xl bg-white p-6 shadow-2xl">
        <button
          onClick={() => onClose(muted)}
          aria-label="关闭"
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-semibold tracking-tight">写在前面</h2>

        <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600">
          <p>这个网站最初是做给女朋友备考雅思用的，但后来我们分开了TMT，它也就被搁置了很久，一直没再打理。</p>
          <p>今天偶然打开仓库，发现已经有 7 个 star 了，原来还有很多小伙伴们在使用它。</p>
          <p>所以我加了一个反馈入口。如果需要什么功能、哪里不好用，都可以写给我。我收到后就会去更新。</p>
          <p>谢谢你还在使用，祝你留学顺利</p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-500">
            <input
              type="checkbox"
              checked={muted}
              onChange={(e) => setMuted(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-gray-300 text-primary-500 focus:ring-primary-300"
            />
            Don't remind again this week
          </label>
          <button
            onClick={() => {
              onClose(muted)
              navigate('/feedback')
            }}
            className="rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
          >
            feedback
          </button>
        </div>
      </div>
    </div>
  )
}
