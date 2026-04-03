import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchSchema } from '@/lib/validations'
import {
  createErrorResponse,
  createSuccessResponse,
  getSearchParams,
} from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = getSearchParams(request)

    // Validate search parameters
    const validationResult = searchSchema.safeParse(searchParams)

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors
      return createErrorResponse(
        `Validation error: ${JSON.stringify(errors)}`,
        400
      )
    }

    const { query, category, pricing_model, sort, page, limit } = validationResult.data
    const offset = (page - 1) * limit

    let dbQuery = supabase
      .from('tools')
      .select(
        `
        id,
        name,
        description,
        website_url,
        logo_url,
        category:categories(id, name, slug),
        pricing_model,
        nonprofit_deal,
        rating_avg,
        review_count,
        created_at,
        updated_at
      `,
        { count: 'exact' }
      )

    // Apply full-text search on name and description
    // Using ilike for case-insensitive pattern matching
    const searchTerm = `%${query}%`
    dbQuery = dbQuery.or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)

    // Apply category filter if provided
    if (category && category !== '') {
      dbQuery = dbQuery.eq('category_id', category)
    }

    // Apply pricing model filter if provided
    if (pricing_model && pricing_model !== '' && ['free', 'freemium', 'nonprofit_discount'].includes(pricing_model)) {
      dbQuery = dbQuery.eq('pricing_model', pricing_model)
    }

    // Apply sorting
    if (sort === 'rating') {
      dbQuery = dbQuery.order('rating_avg', { ascending: false })
    } else if (sort === 'newest') {
      dbQuery = dbQuery.order('created_at', { ascending: false })
    } else {
      // Default: relevance (by newest for now, as tsvector requires custom setup)
      dbQuery = dbQuery.order('created_at', { ascending: false })
    }

    // Apply pagination
    const { data: tools, error, count } = await dbQuery.range(offset, offset + limit - 1)

    if (error) {
      return createErrorResponse(error.message, 500)
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return createSuccessResponse({
      query,
      tools: tools || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
      },
    })
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}
