import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Tool, Category, Review, UserProfile } from '@/types'

/**
 * Create a mock tool object for testing
 */
export function createMockTool(overrides?: Partial<Tool>): Tool {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Tool',
    description: 'A test tool for nonprofit organizations',
    category: 'Communication',
    website_url: 'https://testtool.com',
    logo_url: 'https://example.com/logo.png',
    pricing_model: 'free',
    nonprofit_deal: 'Free for all nonprofits',
    rating_avg: 4.5,
    review_count: 42,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-04-03T00:00:00Z',
    ...overrides,
  }
}

/**
 * Create a mock review object for testing
 */
export function createMockReview(overrides?: Partial<Review>): Review {
  return {
    id: '223e4567-e89b-12d3-a456-426614174000',
    tool_id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: '323e4567-e89b-12d3-a456-426614174000',
    rating: 5,
    title: 'Excellent tool',
    body: 'This tool is absolutely amazing and has transformed how we manage communications.',
    org_size: 'small',
    created_at: '2024-01-15T00:00:00Z',
    ...overrides,
  }
}

/**
 * Create a mock user profile object for testing
 */
export function createMockProfile(overrides?: Partial<UserProfile>): UserProfile {
  return {
    id: '323e4567-e89b-12d3-a456-426614174000',
    email: 'user@example.com',
    display_name: 'John Doe',
    org_name: 'Test Nonprofit',
    org_size: 'medium',
    role: 'user',
    saved_tools: ['123e4567-e89b-12d3-a456-426614174000'],
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

/**
 * Create a mock category object for testing
 */
export function createMockCategory(overrides?: Partial<Category>): Category {
  return {
    id: '423e4567-e89b-12d3-a456-426614174000',
    name: 'Communication',
    slug: 'communication',
    description: 'Tools for nonprofit communication and outreach',
    icon: 'message-circle',
    tool_count: 15,
    ...overrides,
  }
}

/**
 * Render component with providers (can be extended to include Redux, Theme providers, etc.)
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options })
}

/**
 * Helper to create test data batches
 */
export function createMockTools(count: number): Tool[] {
  return Array.from({ length: count }, (_, i) =>
    createMockTool({
      id: `tool-${i}`,
      name: `Tool ${i}`,
      rating_avg: Math.random() * 5,
      review_count: Math.floor(Math.random() * 100),
    })
  )
}

/**
 * Helper to create multiple reviews
 */
export function createMockReviews(count: number, toolId?: string): Review[] {
  return Array.from({ length: count }, (_, i) =>
    createMockReview({
      id: `review-${i}`,
      tool_id: toolId || '123e4567-e89b-12d3-a456-426614174000',
      rating: Math.floor(Math.random() * 5) + 1,
    })
  )
}

/**
 * Wait for async operations in tests
 */
export async function waitFor(
  callback: () => void | boolean,
  options?: { timeout?: number; interval?: number }
): Promise<void> {
  const { timeout = 1000, interval = 50 } = options || {}
  const startTime = Date.now()

  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      try {
        const result = callback()
        if (result || result === undefined) {
          clearInterval(timer)
          resolve()
        }
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          clearInterval(timer)
          reject(error)
        }
      }
    }, interval)

    if (Date.now() - startTime > timeout) {
      clearInterval(timer)
      reject(new Error(`Timeout waiting for condition after ${timeout}ms`))
    }
  })
}
