import { Flame } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
  streak?: number
}

export function Header({ title, subtitle, streak }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-100 bg-white/50 px-8 py-4 backdrop-blur-sm">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {streak != null && streak > 0 && (
        <div className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-600">{streak} day streak</span>
        </div>
      )}
    </header>
  )
}
