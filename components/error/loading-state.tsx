import { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  children?: ReactNode
  message?: string
  fullScreen?: boolean
}

/**
 * Loading State Component
 * Displays while data is being fetched
 */
export function LoadingState({
  children,
  message = 'Loading...',
  fullScreen = false,
}: LoadingStateProps) {
  const content = children || (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-12">
      {content}
    </div>
  )
}

/**
 * Skeleton Component
 * Animated loading placeholder
 */
export function Skeleton({ className = '', count = 1 }: { className?: string; count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-200 rounded ${className}`}
        />
      ))}
    </>
  )
}
