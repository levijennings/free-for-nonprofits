import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createErrorResponse,
  createSuccessResponse,
  requireAuth,
  parsePagination,
  getSearchParams,
} from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
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

    const searchParams = getSearchParams(request)
    const { page, limit, offset } = parsePagination(searchParams)

    // Get user's saved tools
    const { data: savedTools, error, count } = await supabase
      .from('saved_tools')
      .select(
        `
        id,
        tool:tools(
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
        ),
        created_at
      `,
        { count: 'exact' }
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return createErrorResponse(error.message, 500)
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return createSuccessResponse({
      tools: (savedTools || []).map((st: any) => st.tool),
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

    // Parse request body
    const body = await request.json()
    const { tool_id } = body

    if (!tool_id || typeof tool_id !== 'string') {
      return createErrorResponse('tool_id is required', 400)
    }

    // Validate UUID format
    if (!tool_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return createErrorResponse('Invalid tool ID format', 400)
    }

    // Check if tool exists
    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .select('id')
      .eq('id', tool_id)
      .single()

    if (toolError || !tool) {
      return createErrorResponse('Tool not found', 404)
    }

    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_tools')
      .select('id')
      .eq('user_id', user.id)
      .eq('tool_id', tool_id)
      .single()

    if (existing) {
      return createErrorResponse('This tool is already saved', 400)
    }

    // Save the tool
    const { data: savedTool, error: insertError } = await supabase
      .from('saved_tools')
      .insert({
        user_id: user.id,
        tool_id,
      })
      .select()
      .single()

    if (insertError) {
      return createErrorResponse(insertError.message, 500)
    }

    return createSuccessResponse(
      savedTool,
      201,
      'Tool saved successfully'
    )
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { tool_id } = body

    if (!tool_id || typeof tool_id !== 'string') {
      return createErrorResponse('tool_id is required', 400)
    }

    // Validate UUID format
    if (!tool_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return createErrorResponse('Invalid tool ID format', 400)
    }

    // Delete saved tool
    const { error: deleteError } = await supabase
      .from('saved_tools')
      .delete()
      .eq('user_id', user.id)
      .eq('tool_id', tool_id)

    if (deleteError) {
      return createErrorResponse(deleteError.message, 500)
    }

    return createSuccessResponse(
      { tool_id },
      200,
      'Tool unsaved successfully'
    )
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}
