import { vi } from 'vitest'

// Mock fetch globally
global.fetch = vi.fn()

// Mock React hooks
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useState: vi.fn(),
    useEffect: vi.fn(),
  }
})

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: vi.fn(() => ({
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
    removeChannel: vi.fn(),
  })),
}))

// Mock ErrorHandler
vi.mock('@/lib/errors', () => ({
  ErrorHandler: {
    logError: vi.fn(),
  },
}))