const QR_SRC = import.meta.env.BASE_URL + 'support-qr.jpg'

export function SupportNote() {
  return (
    <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6">
      <h2 className="text-sm font-semibold text-gray-700">关于支持</h2>

      <div className="mt-3 space-y-3 text-sm leading-relaxed text-gray-600">
        <p>这个网站完全免费，没有广告，也不打算做成付费产品。</p>
        <p>
          但 AI 的 token 是实打实要花钱的 —— 每日新闻的挖空和翻译都靠 AI 生成，
          用的人多了，AI 辅助记忆的成本也会慢慢上来。目前用的是 DeepSeek 模型，
          每天大概花费 0.15 元。
        </p>
        <p>
          所以如果你觉得它帮到了你，可以扫码支持一包辣条 OvO
          <br />
          当然，不扫码也能免费使用全部功能。
        </p>
      </div>

      <figure className="mt-5">
        <img
          src={QR_SRC}
          alt="微信收款码"
          className="w-44 rounded-xl border border-gray-100"
        />
        <figcaption className="mt-2 text-xs text-gray-400">微信收款码</figcaption>
      </figure>

      <p className="mt-5 text-sm text-gray-500">希望这个网站能帮到你，比心~</p>
    </section>
  )
}
