import { describe, it, expect, vi, beforeEach } from 'vitest'

// Note: Full API route testing is best done via E2E tests (Playwright)
// These unit tests focus on validation and helper functions

describe('API Route Tests', () => {
  describe('Tools API - Validation and Helpers', () => {
    it('should have helper functions for API responses', async () => {
      const { createErrorResponse, createSuccessResponse } = await import(
        '@/lib/api-helpers'
      )

      // Test error response
      const errorResponse = createErrorResponse('Test error', 400)
      expect(errorResponse.status).toBe(400)

      const errorData = await errorResponse.json()
      expect(errorData.success).toBe(false)

      // Test success response
      const testData = { id: '123', name: 'Tool' }
      const successResponse = createSuccessResponse(testData, 201, 'Created')
      expect(successResponse.status).toBe(201)

      const successData = await successResponse.json()
      expect(successData.success).toBe(true)
      expect(successData.data).toEqual(testData)
    })

    it('should validate tool submission schema', async () => {
      const { toolSubmissionSchema } = await import('@/lib/validations')

      // Valid submission
      const valid = toolSubmissionSchema.safeParse({
        name: 'Test Tool',
        description: 'A comprehensive test tool for nonprofits',
        website_url: 'https://testtool.com',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
        pricing_model: 'free',
      })
      expect(valid.success).toBe(true)

      // Invalid - name too short
      const tooShort = toolSubmissionSchema.safeParse({
        name: 'AB',
        description: 'A comprehensive test tool for nonprofits',
        website_url: 'https://testtool.com',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
        pricing_model: 'free',
      })
      expect(tooShort.success).toBe(false)

      // Invalid - description too short
      const shortDesc = toolSubmissionSchema.safeParse({
        name: 'Tool',
        description: 'Short',
        website_url: 'https://testtool.com',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
        pricing_model: 'free',
      })
      expect(shortDesc.success).toBe(false)

      // Invalid - bad URL
      const badUrl = toolSubmissionSchema.safeParse({
        name: 'Tool',
        description: 'A comprehensive test tool for nonprofits',
        website_url: 'not-a-url',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
        pricing_model: 'free',
      })
      expect(badUrl.success).toBe(false)

      // Invalid - bad UUID
      const badUuid = toolSubmissionSchema.safeParse({
        name: 'Tool',
        description: 'A comprehensive test tool for nonprofits',
        website_url: 'https://testtool.com',
        category_id: 'not-a-uuid',
        pricing_model: 'free',
      })
      expect(badUuid.success).toBe(false)

      // Invalid - bad pricing model
      const badPricing = toolSubmissionSchema.safeParse({
        name: 'Tool',
        description: 'A comprehensive test tool for nonprofits',
        website_url: 'https://testtool.com',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
        pricing_model: 'invalid',
      })
      expect(badPricing.success).toBe(false)
    })

    it('should validate pagination schema', async () => {
      const { paginationSchema } = await import('@/lib/validations')

      // Valid
      const valid = paginationSchema.safeParse({ page: 2, limit: 50 })
      expect(valid.success).toBe(true)

      // Defaults
      const defaults = paginationSchema.safeParse({})
      expect(defaults.success).toBe(true)
      if (defaults.success) {
        expect(defaults.data.page).toBe(1)
        expect(defaults.data.limit).toBe(20)
      }

      // Invalid - page too low
      const lowPage = paginationSchema.safeParse({ page: 0 })
      expect(lowPage.success).toBe(false)

      // Invalid - limit too high
      const highLimit = paginationSchema.safeParse({ limit: 200 })
      expect(highLimit.success).toBe(false)
    })

    it('should parse pagination correctly', async () => {
      const { parsePagination } = await import('@/lib/api-helpers')

      // With values
      const result1 = parsePagination({ page: '2', limit: '50' })
      expect(result1.page).toBe(2)
      expect(result1.limit).toBe(50)
      expect(result1.offset).toBe(50) // (2-1)*50

      // With defaults
      const result2 = parsePagination({})
      expect(result2.page).toBe(1)
      expect(result2.limit).toBe(20)
      expect(result2.offset).toBe(0)

      // With invalid - falls back to defaults
      const result3 = parsePagination({ page: '999', limit: '999' })
      expect(result3.page).toBe(1)
      expect(result3.limit).toBe(20)
    })

    it('should validate review schema', async () => {
      const { reviewSchema } = await import('@/lib/validations')

      // Valid
      const valid = reviewSchema.safeParse({
        tool_id: '123e4567-e89b-12d3-a456-426614174000',
        rating: 5,
        title: 'Great tool',
        body: 'This is a comprehensive review of the tool we tested extensively.',
        org_size: 'small',
      })
      expect(valid.success).toBe(true)

      // Invalid - rating too high
      const highRating = reviewSchema.safeParse({
        tool_id: '123e4567-e89b-12d3-a456-426614174000',
        rating: 6,
        title: 'Great tool',
        body: 'This is a comprehensive review of the tool we tested extensively.',
        org_size: 'small',
      })
      expect(highRating.success).toBe(false)

      // Invalid - rating too low
      const lowRating = reviewSchema.safeParse({
        tool_id: '123e4567-e89b-12d3-a456-426614174000',
        rating: 0,
        title: 'Great tool',
        body: 'This is a comprehensive review of the tool we tested extensively.',
        org_size: 'small',
      })
      expect(lowRating.success).toBe(false)

      // Invalid - decimal rating
      const decimalRating = reviewSchema.safeParse({
        tool_id: '123e4567-e89b-12d3-a456-426614174000',
        rating: 3.5,
        title: 'Great tool',
        body: 'This is a comprehensive review of the tool we tested extensively.',
        org_size: 'small',
      })
      expect(decimalRating.success).toBe(false)
    })

    it('should validate search schema', async () => {
      const { searchSchema } = await import('@/lib/validations')

      // Valid
      const valid = searchSchema.safeParse({
        query: 'communication tools',
        category: '123e4567-e89b-12d3-a456-426614174000',
        pricing_model: 'free',
        sort: 'rating',
        page: 1,
        limit: 20,
      })
      expect(valid.success).toBe(true)

      // Valid with minimal
      const minimal = searchSchema.safeParse({
        query: 'tools',
      })
      expect(minimal.success).toBe(true)

      // Invalid - empty query
      const emptyQuery = searchSchema.safeParse({
        query: '',
      })
      expect(emptyQuery.success).toBe(false)

      // Invalid - query too long
      const longQuery = searchSchema.safeParse({
        query: 'a'.repeat(101),
      })
      expect(longQuery.success).toBe(false)
    })

    it('should validate profile update schema', async () => {
      const { profileUpdateSchema } = await import('@/lib/validations')

      // Valid - all fields
      const full = profileUpdateSchema.safeParse({
        display_name: 'John Doe',
        org_name: 'Test Nonprofit',
        org_size: 'medium',
      })
      expect(full.success).toBe(true)

      // Valid - partial
      const partial = profileUpdateSchema.safeParse({
        display_name: 'Jane Smith',
      })
      expect(partial.success).toBe(true)

      // Valid - empty object
      const empty = profileUpdateSchema.safeParse({})
      expect(empty.success).toBe(true)

      // Valid - empty strings allowed
      const emptyStrings = profileUpdateSchema.safeParse({
        display_name: '',
        org_name: '',
      })
      expect(emptyStrings.success).toBe(true)

      // Invalid - display_name too short
      const tooShort = profileUpdateSchema.safeParse({
        display_name: 'J',
      })
      expect(tooShort.success).toBe(false)
    })

    it('should handle different pricing models', async () => {
      const { toolSubmissionSchema } = await import('@/lib/validations')

      const models = ['free', 'freemium', 'nonprofit_discount']

      for (const model of models) {
        const result = toolSubmissionSchema.safeParse({
          name: 'Test Tool',
          description: 'A comprehensive test tool for nonprofits',
          website_url: 'https://testtool.com',
          category_id: '123e4567-e89b-12d3-a456-426614174000',
          pricing_model: model,
        })
        expect(result.success).toBe(true, `Failed for model: ${model}`)
      }
    })

    it('should handle optional fields', async () => {
      const { toolSubmissionSchema } = await import('@/lib/validations')

      // Without optional fields
      const minimal = toolSubmissionSchema.safeParse({
        name: 'Test Tool',
        description: 'A comprehensive test tool for nonprofits',
        website_url: 'https://testtool.com',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
        pricing_model: 'free',
      })
      expect(minimal.success).toBe(true)

      // With nonprofit_deal
      const withDeal = toolSubmissionSchema.safeParse({
        name: 'Test Tool',
        description: 'A comprehensive test tool for nonprofits',
        website_url: 'https://testtool.com',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
        pricing_model: 'freemium',
        nonprofit_deal: 'Free for qualified nonprofits',
      })
      expect(withDeal.success).toBe(true)

      // With features
      const withFeatures = toolSubmissionSchema.safeParse({
        name: 'Test Tool',
        description: 'A comprehensive test tool for nonprofits',
        website_url: 'https://testtool.com',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
        pricing_model: 'free',
        features: ['Feature 1', 'Feature 2'],
      })
      expect(withFeatures.success).toBe(true)
    })
  })

  describe('Testing Strategy', () => {
    it('should document E2E testing approach', () => {
      // Full API route testing (with actual requests/responses) is best done
      // via Playwright E2E tests, which are in e2e/tools.spec.ts
      //
      // Unit tests here focus on:
      // - Validation schemas
      // - Helper function logic
      // - Error response formatting
      // - Pagination calculations
      //
      // E2E tests verify:
      // - Complete request/response cycle
      // - Database operations
      // - Authentication flows
      // - Real error scenarios
      //
      // This separation ensures:
      // - Fast unit tests
      // - Comprehensive integration coverage
      // - Clear separation of concerns

      expect(true).toBe(true)
    })
  })
})
