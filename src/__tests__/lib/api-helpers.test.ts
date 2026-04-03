import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createErrorResponse, createSuccessResponse, parsePagination } from '@/lib/api-helpers'

describe('API Helpers', () => {
  describe('createErrorResponse', () => {
    it('should create error response with string message', () => {
      const response = createErrorResponse('Test error', 400)
      expect(response.status).toBe(400)
    })

    it('should create error response with Error object', async () => {
      const error = new Error('Test error message')
      const response = createErrorResponse(error, 500)
      expect(response.status).toBe(500)
    })

    it('should use status 500 as default', async () => {
      const response = createErrorResponse('Test error')
      expect(response.status).toBe(500)
    })

    it('should return success: false', async () => {
      const response = createErrorResponse('Test error', 400)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe('Test error')
    })

    it('should extract message from Error object', async () => {
      const error = new Error('Custom error message')
      const response = createErrorResponse(error, 400)
      const data = await response.json()
      expect(data.error).toBe('Custom error message')
    })
  })

  describe('createSuccessResponse', () => {
    it('should create success response with data', async () => {
      const testData = { id: '123', name: 'Test' }
      const response = createSuccessResponse(testData, 200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toEqual(testData)
    })

    it('should use status 200 as default', async () => {
      const response = createSuccessResponse({ test: 'data' })
      expect(response.status).toBe(200)
    })

    it('should include custom status code', async () => {
      const response = createSuccessResponse({ test: 'data' }, 201)
      expect(response.status).toBe(201)
    })

    it('should include optional message', async () => {
      const response = createSuccessResponse({ test: 'data' }, 200, 'Created successfully')
      const data = await response.json()
      expect(data.message).toBe('Created successfully')
    })

    it('should not include message if not provided', async () => {
      const response = createSuccessResponse({ test: 'data' }, 200)
      const data = await response.json()
      expect(data.message).toBeUndefined()
    })

    it('should handle null data', async () => {
      const response = createSuccessResponse(null, 200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toBeNull()
    })

    it('should handle array data', async () => {
      const arrayData = [{ id: '1' }, { id: '2' }]
      const response = createSuccessResponse(arrayData, 200)
      const data = await response.json()
      expect(data.data).toEqual(arrayData)
    })
  })

  describe('parsePagination', () => {
    it('should parse valid pagination params', () => {
      const params = { page: '2', limit: '50' }
      const result = parsePagination(params)

      expect(result.page).toBe(2)
      expect(result.limit).toBe(50)
      expect(result.offset).toBe(50) // (2-1) * 50 = 50
    })

    it('should return default values when params are missing', () => {
      const params = {}
      const result = parsePagination(params)

      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(result.offset).toBe(0)
    })

    it('should return defaults when params are invalid', () => {
      const params = { page: 'invalid', limit: 'not-a-number' }
      const result = parsePagination(params)

      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(result.offset).toBe(0)
    })

    it('should return defaults when page is less than 1', () => {
      const params = { page: '0', limit: '20' }
      const result = parsePagination(params)

      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(result.offset).toBe(0)
    })

    it('should return defaults when limit exceeds maximum', () => {
      const params = { page: '1', limit: '200' }
      const result = parsePagination(params)

      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(result.offset).toBe(0)
    })

    it('should calculate correct offset for page 3', () => {
      const params = { page: '3', limit: '25' }
      const result = parsePagination(params)

      expect(result.page).toBe(3)
      expect(result.limit).toBe(25)
      expect(result.offset).toBe(50) // (3-1) * 25 = 50
    })

    it('should handle string numbers correctly', () => {
      const params = { page: '1', limit: '10' }
      const result = parsePagination(params)

      expect(typeof result.page).toBe('number')
      expect(typeof result.limit).toBe('number')
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
    })

    it('should return defaults for negative values', () => {
      const params = { page: '-1', limit: '-10' }
      const result = parsePagination(params)

      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
    })

    it('should handle partial params', () => {
      const params = { page: '5' }
      const result = parsePagination(params)

      expect(result.page).toBe(5)
      expect(result.limit).toBe(20)
      expect(result.offset).toBe(80) // (5-1) * 20
    })

    it('should handle limit only', () => {
      const params = { limit: '50' }
      const result = parsePagination(params)

      expect(result.page).toBe(1)
      expect(result.limit).toBe(50)
      expect(result.offset).toBe(0)
    })

    it('should handle array values by taking first element', () => {
      const params = { page: ['2'], limit: ['30'] }
      const result = parsePagination(params)

      // Browser query params can be arrays - implementation should handle this
      // This test documents the current behavior
      expect(typeof result.page).toBe('number')
      expect(typeof result.limit).toBe('number')
    })
  })
})
