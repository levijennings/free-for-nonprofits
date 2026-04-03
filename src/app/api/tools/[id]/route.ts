import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createErrorResponse,
  createSuccessResponse,
  requireAdmin,
  getSearchParams,
} from '@/lib/api-helpers'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const supabase = await createClient()

    // Validate UUID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return createErrorResponse('Invalid tool ID format', 400)
    }

    // Get tool with category and reviews
    const { data: tool, error: toolError } = await supabase
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
        features,
        rating_avg,
        review_count,
        created_at,
        updated_at,
        reviews(
          id,
          rating,
          title,
          body,
          org_size,
          created_at,
          user:profiles(id, display_name)
        )
      `
      )
      .eq('id', id)
      .single()

    if (toolError || !tool) {
      return createErrorResponse('Tool not found', 404)
    }

    return createSuccessResponse(tool)
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Validate UUID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return createErrorResponse('Invalid tool ID format', 400)
    }

    // Check admin access
    const { isAdmin, error: adminError } = await requireAdmin(request)

    if (!isAdmin || adminError) {
      return createErrorResponse('Forbidden: Admin access required', 403)
    }

    const supabase = await createClient()
    const body = await request.json()

    // Allow updating specific fields only
    const allowedFields = ['name', 'description', 'website_url', 'logo_url', 'nonprofit_deal', 'features', 'status']
    const updateData: Record<string, any> = {}

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return createErrorResponse('No valid fields to update', 400)
    }

    // Update tool
    const { data: updatedTool, error: updateError } = await supabase
      .from('tools')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return createErrorResponse(updateError.message, 500)
    }

    if (!updatedTool) {
      return createErrorResponse('Tool not found', 404)
    }

    return createSuccessResponse(updatedTool)
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
      return createErrorResponse('Invalid tool ID format', 400)
    }

    // Check admin access
    const { isAdmin, error: adminError } = await requireAdmin(request)

    if (!isAdmin || adminError) {
      return createErrorResponse('Forbidden: Admin access required', 403)
    }

    const supabase = await createClient()

    // Delete associated reviews first
    await supabase.from('reviews').delete().eq('tool_id', id)

    // Delete the tool
    const { error: deleteError } = await supabase.from('tools').delete().eq('id', id)

    if (deleteError) {
      return createErrorResponse(deleteError.message, 500)
    }

    return createSuccessResponse(
      { id },
      200,
      'Tool deleted successfully'
    )
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}
