import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getValidationErrors } from './schemas'

/**
 * Validates request body against a Zod schema
 * Returns validated data or error response
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json()
    const validatedData = schema.parse(body)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = getValidationErrors(error)
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Validation failed',
            details: errors,
            message: 'Please check your input and try again'
          },
          { status: 400 }
        )
      }
    }
    
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Invalid request body',
          message: 'Request body must be valid JSON'
        },
        { status: 400 }
      )
    }
  }
}

/**
 * Validates query parameters against a Zod schema
 * Returns validated data or error response
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const { searchParams } = new URL(request.url)
    const params: Record<string, any> = {}
    
    // Convert URLSearchParams to object
    searchParams.forEach((value, key) => {
      // Handle arrays (e.g., tags[]=value1&tags[]=value2)
      if (key.endsWith('[]')) {
        const arrayKey = key.slice(0, -2)
        if (!params[arrayKey]) {
          params[arrayKey] = []
        }
        params[arrayKey].push(value)
      } else {
        // Try to parse numbers and booleans
        if (value === 'true') {
          params[key] = true
        } else if (value === 'false') {
          params[key] = false
        } else if (!isNaN(Number(value)) && value !== '') {
          params[key] = Number(value)
        } else {
          params[key] = value
        }
      }
    })
    
    const validatedData = schema.parse(params)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = getValidationErrors(error)
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Invalid query parameters',
            details: errors,
            message: 'Please check your query parameters and try again'
          },
          { status: 400 }
        )
      }
    }
    
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Invalid query parameters',
          message: 'Query parameters are malformed'
        },
        { status: 400 }
      )
    }
  }
}

/**
 * Rate limiting configuration
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { success: boolean; response?: NextResponse } {
  const now = Date.now()
  const windowStart = now - windowMs
  
  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitMap.delete(key)
    }
  }
  
  const current = rateLimitMap.get(identifier)
  
  if (!current) {
    // First request from this identifier
    rateLimitMap.set(identifier, { count: 1, resetTime: now })
    return { success: true }
  }
  
  if (current.resetTime < windowStart) {
    // Window has expired, reset
    rateLimitMap.set(identifier, { count: 1, resetTime: now })
    return { success: true }
  }
  
  if (current.count >= maxRequests) {
    // Rate limit exceeded
    const resetIn = Math.ceil((current.resetTime + windowMs - now) / 1000)
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again in ${resetIn} seconds.`,
          retryAfter: resetIn
        },
        { 
          status: 429,
          headers: {
            'Retry-After': resetIn.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil((current.resetTime + windowMs) / 1000).toString()
          }
        }
      )
    }
  }
  
  // Increment count
  current.count++
  return { success: true }
}

/**
 * Validates UUID parameters
 */
export function validateUUID(id: string, paramName: string = 'id'): {
  success: boolean
  response?: NextResponse
} {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  
  if (!uuidRegex.test(id)) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Invalid ID format',
          message: `${paramName} must be a valid UUID`,
          details: { [paramName]: ['Invalid UUID format'] }
        },
        { status: 400 }
      )
    }
  }
  
  return { success: true }
}

/**
 * Sanitizes string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Validates file upload
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number // in bytes
    allowedTypes?: string[]
    maxFiles?: number
  } = {}
): { success: boolean; error?: string } {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles = 1
  } = options
  
  if (file.size > maxSize) {
    return {
      success: false,
      error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
    }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: `File type must be one of: ${allowedTypes.join(', ')}`
    }
  }
  
  return { success: true }
}