import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createErrorResponse,
  createSuccessResponse,
  requireAdmin,
  parsePagination,
  getSearchParams,
} from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const { isAdmin, error: adminError } = await requireAdmin(request)

    if (!isAdmin || adminError) {
      return createErrorResponse('Forbidden: Admin access required', 403)
    }

    const supabase = await createClient()
    const searchParams = getSearchParams(request)
    const { page, limit, offset } = parsePagination(searchParams)

    // Get pending tools for approval
    const { data: tools, error, count } = await supabase
      .from('tools')
      .select(
        `
        id,
        name,
        description,
        website_url,
        category:categories(id, name, slug),
        pricing_model,
        nonprofit_deal,
        features,
        status,
        submitted_by:profiles(id, display_name, email),
        created_at,
        updated_at
      `,
        { count: 'exact' }
      )
      .in('status', ['pending', 'rejected'])
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return createErrorResponse(error.message, 500)
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return createSuccessResponse({
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

export async function PATCH(request: NextRequest) {
  try {
    // Check admin access
    const { isAdmin, error: adminError } = await requireAdmin(request)

    if (!isAdmin || adminError) {
      return createErrorResponse('Forbidden: Admin access required', 403)
    }

    const supabase = await createClient()
    const body = await request.json()
    const { tool_id, status, rejection_reason } = body

    if (!tool_id || typeof tool_id !== 'string') {
      return createErrorResponse('tool_id is required', 400)
    }

    if (!status || !['approved', 'rejected'].includes(status)) {
      return createErrorResponse('status must be either "approved" or "rejected"', 400)
    }

    // Validate UUID format
    if (!tool_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return createErrorResponse('Invalid tool ID format', 400)
    }

    // Get the tool
    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .select('id, status, submitted_by')
      .eq('id', tool_id)
      .single()

    if (toolError || !tool) {
      return createErrorResponse('Tool not found', 404)
    }

    if (tool.status === 'approved') {
      return createErrorResponse('Tool is already approved', 400)
    }

    // Update tool status
    const updateData: Record<string, any> = { status }

    if (status === 'rejected' && rejection_reason) {
      updateData.rejection_reason = rejection_reason
    }

    const { data: updatedTool, error: updateError } = await supabase
      .from('tools')
      .update(updateData)
      .eq('id', tool_id)
      .select(
        `
        id,
        name,
        description,
        website_url,
        category:categories(id, name, slug),
        pricing_model,
        nonprofit_deal,
        features,
        status,
        rejection_reason,
        created_at,
        updated_at
      `
      )
      .single()

    if (updateError) {
      return createErrorResponse(updateError.message, 500)
    }

    const message = status === 'approved'
      ? 'Tool approved successfully'
      : 'Tool rejected successfully'

    return createSuccessResponse(
      updatedTool,
      200,
      message
    )
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}
