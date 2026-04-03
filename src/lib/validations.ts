import { z } from 'zod'

export const toolSubmissionSchema = z.object({
  name: z.string().min(3, 'Tool name must be at least 3 characters').max(100, 'Tool name must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  website_url: z.string().url('Must be a valid URL'),
  category_id: z.string().uuid('Invalid category ID'),
  pricing_model: z.enum(['free', 'freemium', 'nonprofit_discount'], {
    errorMap: () => ({ message: 'Pricing model must be one of: free, freemium, nonprofit_discount' })
  }),
  nonprofit_deal: z.string().max(500, 'Nonprofit deal description must be less than 500 characters').optional().or(z.literal('')),
  features: z.array(z.string().min(1).max(100)).min(1, 'At least one feature is required').max(10, 'Maximum 10 features allowed').optional().or(z.literal(null)),
})

export const reviewSchema = z.object({
  tool_id: z.string().uuid('Invalid tool ID'),
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  body: z.string().min(10, 'Review must be at least 10 characters').max(2000, 'Review must be less than 2000 characters'),
  org_size: z.enum(['small', 'medium', 'large'], {
    errorMap: () => ({ message: 'Organization size must be one of: small, medium, large' })
  }),
})

export const profileUpdateSchema = z.object({
  display_name: z.string().min(2, 'Display name must be at least 2 characters').max(100, 'Display name must be less than 100 characters').optional().or(z.literal('')),
  org_name: z.string().min(2, 'Organization name must be at least 2 characters').max(100, 'Organization name must be less than 100 characters').optional().or(z.literal('')),
  org_size: z.enum(['small', 'medium', 'large']).optional().or(z.literal('')),
})

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query must be less than 100 characters'),
  category: z.string().uuid().optional().or(z.literal('')),
  pricing_model: z.enum(['free', 'freemium', 'nonprofit_discount']).optional().or(z.literal('')),
  sort: z.enum(['relevance', 'rating', 'newest']).optional().or(z.literal('')),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
})

export type ToolSubmission = z.infer<typeof toolSubmissionSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>
export type SearchQuery = z.infer<typeof searchSchema>
export type Pagination = z.infer<typeof paginationSchema>
