import { Link } from 'react-router-dom'
import { Info } from 'lucide-react'

export function AiNetworkHint() {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-xs leading-relaxed text-gray-500">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
      <p>
        AI 功能需要挂代理（梯子）才能使用 —— 服务在境外，大陆网络直连不上。
        <br />
        不知道怎么弄？
        <Link to="/feedback" className="text-primary-500 hover:underline">
          在反馈里留下邮箱，我告诉你
        </Link>
      </p>
    </div>
  )
}
