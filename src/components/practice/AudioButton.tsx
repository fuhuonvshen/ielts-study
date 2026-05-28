import { Volume2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AudioButtonProps {
  onClick: () => void
  isPlaying: boolean
  size?: 'sm' | 'lg'
}

export function AudioButton({ onClick, isPlaying, size = 'lg' }: AudioButtonProps) {
  const sizeClass = size === 'lg' ? 'h-20 w-20' : 'h-12 w-12'

  return (
    <button
      onClick={onClick}
      disabled={isPlaying}
      className={cn(
        'group relative flex items-center justify-center rounded-full transition-all duration-300',
        'bg-white shadow-lg shadow-gray-200/50 ring-1 ring-gray-100',
        'hover:shadow-xl hover:shadow-gray-200/80 hover:scale-105',
        'active:scale-95',
        sizeClass
      )}
    >
      <div
        className={cn(
          'absolute inset-0 rounded-full bg-primary-500/10 transition-opacity duration-300',
          isPlaying ? 'opacity-100 animate-pulse' : 'opacity-0'
        )}
      />
      {isPlaying ? (
        <Loader2 className="relative z-10 h-8 w-8 animate-spin text-primary-500" />
      ) : (
        <Volume2 className="relative z-10 h-8 w-8 text-gray-600 transition-colors group-hover:text-primary-500" />
      )}
    </button>
  )
}
