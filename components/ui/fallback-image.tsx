"use client"

import { useState } from 'react'
import Image from 'next/image'
import { ImageIcon, User } from 'lucide-react'

interface FallbackImageProps {
  src?: string | null
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  fallbackType?: 'gradient' | 'icon' | 'avatar'
  fallbackText?: string
  priority?: boolean
  sizes?: string
}

/**
 * Image component with automatic fallback handling
 * - Shows gradient placeholder if image fails to load
 * - Supports avatar fallback with initials
 * - Handles null/undefined src gracefully
 */
export function FallbackImage({
  src,
  alt,
  fill,
  width,
  height,
  className = '',
  fallbackType = 'gradient',
  fallbackText,
  priority,
  sizes
}: FallbackImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  // If no src or error occurred, show fallback
  if (!src || error) {
    if (fallbackType === 'avatar') {
      // Avatar with initials
      const initials = fallbackText
        ? fallbackText
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : '?'

      return (
        <div
          className={`flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold ${className}`}
          style={fill ? undefined : { width, height }}
        >
          {initials}
        </div>
      )
    }

    if (fallbackType === 'icon') {
      // Icon fallback
      return (
        <div
          className={`flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 ${className}`}
          style={fill ? undefined : { width, height }}
        >
          <ImageIcon className="w-1/3 h-1/3 text-gray-400" />
        </div>
      )
    }

    // Gradient fallback (default)
    return (
      <div
        className={`bg-gradient-to-br from-blue-400 to-purple-500 ${className}`}
        style={fill ? undefined : { width, height }}
      />
    )
  }

  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
        priority={priority}
        sizes={sizes}
      />
      {loading && (
        <div
          className={`absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse ${className}`}
        />
      )}
    </>
  )
}

/**
 * User avatar component with automatic fallback to initials
 */
export function UserAvatar({
  src,
  name,
  size = 40,
  className = ''
}: {
  src?: string | null
  name: string
  size?: number
  className?: string
}) {
  return (
    <div
      className={`relative rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <FallbackImage
        src={src}
        alt={name}
        fill
        fallbackType="avatar"
        fallbackText={name}
        className="rounded-full"
      />
    </div>
  )
}

/**
 * Package/Destination image with gradient fallback
 */
export function PackageImage({
  src,
  alt,
  className = ''
}: {
  src?: string | null
  alt: string
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <FallbackImage
        src={src}
        alt={alt}
        fill
        fallbackType="gradient"
        className="object-cover"
      />
    </div>
  )
}
