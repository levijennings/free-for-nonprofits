import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { reviewSchema, paginationSchema } from '@/lib/validations'
import {
  createErrorResponse,
  createSuccessResponse,
  requireAuth,
  parsePagination,
  getSearchParams,
} from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = getSearchParams(request)
    const { page, limit, offset } = parsePagination(searchParams)

    // Get tool_id filter if provided
    const toolId = searchParams.tool_id as string | undefined

    let query = supabase
      .from('reviews')
      .select(
        `
        id,
        tool_id,
        rating,
        title,
        body,
        org_size,
        created_at,
        user:profiles(id, display_name)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })

    if (toolId) {
      query = query.eq('tool_id', toolId)
    }

    const { data: reviews, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      return createErrorResponse(error.message, 500)
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return createSuccessResponse({
      reviews: reviews || [],
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

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = reviewSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors
      return createErrorResponse(
        `Validation error: ${JSON.stringify(errors)}`,
        400
      )
    }

    const { tool_id, rating, title, body: reviewBody, org_size } = validationResult.data

    // Check if tool exists
    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .select('id')
      .eq('id', tool_id)
      .single()

    if (toolError || !tool) {
      return createErrorResponse('Tool not found', 404)
    }

    // Check if user already reviewed this tool
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('tool_id', tool_id)
      .eq('user_id', user.id)
      .single()

    if (existingReview) {
      return createErrorResponse(
        'You have already reviewed this tool. Update your existing review instead.',
        400
      )
    }

    // Create new review
    const { data: newReview, error: insertError } = await supabase
      .from('reviews')
      .insert({
        tool_id,
        user_id: user.id,
        rating,
        title,
        body: reviewBody,
        org_size,
      })
      .select(
        `
        id,
        tool_id,
        rating,
        title,
        body,
        org_size,
        created_at,
        user:profiles(id, display_name)
      `
      )
      .single()

    if (insertError) {
      return createErrorResponse(insertError.message, 500)
    }

    // Update tool's rating average and review count
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('tool_id', tool_id)

    if (allReviews && allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

      await supabase
        .from('tools')
        .update({
          rating_avg: Math.round(avgRating * 10) / 10,
          review_count: allReviews.length,
        })
        .eq('id', tool_id)
    }

    return createSuccessResponse(newReview, 201, 'Review created successfully')
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}
