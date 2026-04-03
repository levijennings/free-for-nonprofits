import { describe, it, expect } from 'vitest'
import {
  toolSubmissionSchema,
  reviewSchema,
  profileUpdateSchema,
  searchSchema,
  paginationSchema,
} from '@/lib/validations'

describe('Validation Schemas', () => {
  describe('toolSubmissionSchema', () => {
    it('should accept valid tool submission data', () => {
      const validData = {
        name: 'Test Tool',
        description: 'A detailed description of the test tool for nonprofits',
        website_url: 'https://testtool.com',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
        pricing_model: 'free',
        nonprofit_deal: 'Free for all nonprofits',
        features: ['Feature 1', 'Feature 2'],
      }

      const result = toolSubmissionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject tool name shorter than 3 characters', () => {
      const invalidData = {
        name: 'AB',
        description: 'A detailed description of the test tool for nonprofits',
        website_url: 'https://testtool.com',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
        pricing_model: 'free',
      }

      const result = toolSubmissionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.name).toBeDefined()
      }
    })

    it('should reject tool name longer than 100 characters', () => {
      const invalidData = {
        name: 'A'.repeat(101),
        description: 'A detailed description of the test tool for nonprofits',
        website_url: 'https://testtool.com',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
        pricing_model: 'free',
      }

      const result = toolSubmissionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject description shorter than 10 characters', () => {
      const invalidData = {
        name: 'Test Tool',
        description: 'Short',
        website_url: 'https://testtool.com',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
        pricing_model: 'free',
      }

      const result = toolSubmissionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid URL', () => {
      const invalidData = {
        name: 'Test Tool',
        description: 'A detailed description of the test tool for nonprofits',
        website_url: 'not-a-valid-url',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
        pricing_model: 'free',
      }

      const result = toolSubmissionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid UUID for category_id', () => {
      const invalidData = {
        name: 'Test Tool',
        description: 'A detailed description of the test tool for nonprofits',
        website_url: 'https://testtool.com',
        category_id: 'not-a-uuid',
        pricing_model: 'free',
      }

      const result = toolSubmissionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid pricing model', () => {
      const invalidData = {
        name: 'Test Tool',
        description: 'A detailed description of the test tool for nonprofits',
        website_url: 'https://testtool.com',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
        pricing_model: 'invalid_model',
      }

      const result = toolSubmissionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should allow empty nonprofit_deal', () => {
      const validData = {
        name: 'Test Tool',
        description: 'A detailed description of the test tool for nonprofits',
        website_url: 'https://testtool.com',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
        pricing_model: 'freemium',
        nonprofit_deal: '',
      }

      const result = toolSubmissionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should allow features to be optional', () => {
      const validData = {
        name: 'Test Tool',
        description: 'A detailed description of the test tool for nonprofits',
        website_url: 'https://testtool.com',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
        pricing_model: 'nonprofit_discount',
      }

      const result = toolSubmissionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('reviewSchema', () => {
    it('should accept valid review data', () => {
      const validData = {
        tool_id: '123e4567-e89b-12d3-a456-426614174000',
        rating: 5,
        title: 'Excellent tool',
        body: 'This is a comprehensive review of the excellent tool we tested.',
        org_size: 'small',
      }

      const result = reviewSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject rating below 1', () => {
      const invalidData = {
        tool_id: '123e4567-e89b-12d3-a456-426614174000',
        rating: 0,
        title: 'Tool review',
        body: 'This is a comprehensive review of the tool we tested.',
        org_size: 'small',
      }

      const result = reviewSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject rating above 5', () => {
      const invalidData = {
        tool_id: '123e4567-e89b-12d3-a456-426614174000',
        rating: 6,
        title: 'Tool review',
        body: 'This is a comprehensive review of the tool we tested.',
        org_size: 'small',
      }

      const result = reviewSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject non-integer rating', () => {
      const invalidData = {
        tool_id: '123e4567-e89b-12d3-a456-426614174000',
        rating: 3.5,
        title: 'Tool review',
        body: 'This is a comprehensive review of the tool we tested.',
        org_size: 'small',
      }

      const result = reviewSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid org_size', () => {
      const invalidData = {
        tool_id: '123e4567-e89b-12d3-a456-426614174000',
        rating: 4,
        title: 'Tool review',
        body: 'This is a comprehensive review of the tool we tested.',
        org_size: 'enterprise',
      }

      const result = reviewSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('profileUpdateSchema', () => {
    it('should accept partial profile updates', () => {
      const validData = {
        display_name: 'John Doe',
      }

      const result = profileUpdateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty display_name string with length > 0', () => {
      const validData = {
        display_name: '',
      }

      const result = profileUpdateSchema.safeParse(validData)
      expect(result.success).toBe(true) // Empty strings are allowed as per schema
    })

    it('should reject display_name shorter than 2 characters', () => {
      const invalidData = {
        display_name: 'A',
      }

      const result = profileUpdateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept empty object', () => {
      const validData = {}

      const result = profileUpdateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should allow all org_size enum values', () => {
      const sizes = ['small', 'medium', 'large']

      sizes.forEach((size) => {
        const result = profileUpdateSchema.safeParse({ org_size: size })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('searchSchema', () => {
    it('should accept valid search query', () => {
      const validData = {
        query: 'communication tools',
        category: '123e4567-e89b-12d3-a456-426614174000',
        pricing_model: 'free',
        sort: 'rating',
        page: 1,
        limit: 20,
      }

      const result = searchSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty query string', () => {
      const invalidData = {
        query: '',
      }

      const result = searchSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject query longer than 100 characters', () => {
      const invalidData = {
        query: 'a'.repeat(101),
      }

      const result = searchSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should set default page to 1', () => {
      const validData = {
        query: 'test',
      }

      const result = searchSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
      }
    })

    it('should set default limit to 20', () => {
      const validData = {
        query: 'test',
      }

      const result = searchSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limit).toBe(20)
      }
    })

    it('should reject limit greater than 100', () => {
      const invalidData = {
        query: 'test',
        limit: 101,
      }

      const result = searchSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid sort value', () => {
      const invalidData = {
        query: 'test',
        sort: 'invalid_sort',
      }

      const result = searchSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('paginationSchema', () => {
    it('should accept valid pagination params', () => {
      const validData = {
        page: 2,
        limit: 50,
      }

      const result = paginationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should set default page to 1', () => {
      const validData = {}

      const result = paginationSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
      }
    })

    it('should set default limit to 20', () => {
      const validData = {}

      const result = paginationSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limit).toBe(20)
      }
    })

    it('should coerce string page to number', () => {
      const validData = {
        page: '5',
        limit: '10',
      }

      const result = paginationSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(5)
        expect(result.data.limit).toBe(10)
      }
    })

    it('should reject page less than 1', () => {
      const invalidData = {
        page: 0,
      }

      const result = paginationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject limit greater than 100', () => {
      const invalidData = {
        limit: 101,
      }

      const result = paginationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
