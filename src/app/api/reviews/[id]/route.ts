import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createErrorResponse,
  createSuccessResponse,
  requireAuth,
} from '@/lib/api-helpers'

interface RouteParams {
  params: {
    id: string
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Validate UUID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return createErrorResponse('Invalid review ID format', 400)
    }

    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Get the review to check ownership
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('user_id, tool_id')
      .eq('id', id)
      .single()

    if (reviewError || !review) {
      return createErrorResponse('Review not found', 404)
    }

    if (review.user_id !== user.id) {
      return createErrorResponse('Forbidden: You can only edit your own reviews', 403)
    }

    // Parse request body
    const body = await request.json()

    // Allow updating only specific fields
    const allowedFields = ['rating', 'title', 'body', 'org_size']
    const updateData: Record<string, any> = {}

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return createErrorResponse('No valid fields to update', 400)
    }

    // Validate rating if provided
    if (updateData.rating !== undefined) {
      if (!Number.isInteger(updateData.rating) || updateData.rating < 1 || updateData.rating > 5) {
        return createErrorResponse('Rating must be an integer between 1 and 5', 400)
      }
    }

    // Update review
    const { data: updatedReview, error: updateError } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', id)
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

    if (updateError) {
      return createErrorResponse(updateError.message, 500)
    }

    // Recalculate tool rating average
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('tool_id', review.tool_id)

    if (allReviews && allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

      await supabase
        .from('tools')
        .update({
          rating_avg: Math.round(avgRating * 10) / 10,
        })
        .eq('id', review.tool_id)
    }

    return createSuccessResponse(updatedReview)
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Validate UUID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return createErrorResponse('Invalid review ID format', 400)
    }

    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Get the review to check ownership
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('user_id, tool_id')
      .eq('id', id)
      .single()

    if (reviewError || !review) {
      return createErrorResponse('Review not found', 404)
    }

    if (review.user_id !== user.id) {
      return createErrorResponse('Forbidden: You can only delete your own reviews', 403)
    }

    // Delete the review
    const { error: deleteError } = await supabase.from('reviews').delete().eq('id', id)

    if (deleteError) {
      return createErrorResponse(deleteError.message, 500)
    }

    // Recalculate tool rating average and review count
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('tool_id', review.tool_id)

    if (allReviews && allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

      await supabase
        .from('tools')
        .update({
          rating_avg: Math.round(avgRating * 10) / 10,
          review_count: allReviews.length,
        })
        .eq('id', review.tool_id)
    } else {
      // No reviews left
      await supabase
        .from('tools')
        .update({
          rating_avg: 0,
          review_count: 0,
        })
        .eq('id', review.tool_id)
    }

    return createSuccessResponse(
      { id },
      200,
      'Review deleted successfully'
    )
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}
