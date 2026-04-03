import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { toolSubmissionSchema, paginationSchema } from '@/lib/validations'
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

    // Get category and pricing filters
    const category = searchParams.category as string | undefined
    const pricingModel = searchParams.pricing_model as string | undefined

    let query = supabase
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
      .order('created_at', { ascending: false })

    // Apply filters
    if (category) {
      query = query.eq('category_id', category)
    }

    if (pricingModel && ['free', 'freemium', 'nonprofit_discount'].includes(pricingModel)) {
      query = query.eq('pricing_model', pricingModel)
    }

    // Apply pagination
    const { data: tools, error, count } = await query.range(offset, offset + limit - 1)

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
    const validationResult = toolSubmissionSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors
      return createErrorResponse(
        `Validation error: ${JSON.stringify(errors)}`,
        400
      )
    }

    const { name, description, website_url, category_id, pricing_model, nonprofit_deal, features } =
      validationResult.data

    // Check if tool with this name already exists
    const { data: existing } = await supabase
      .from('tools')
      .select('id')
      .eq('name', name)
      .single()

    if (existing) {
      return createErrorResponse('A tool with this name already exists', 400)
    }

    // Create new tool
    const { data: newTool, error: insertError } = await supabase
      .from('tools')
      .insert({
        name,
        description,
        website_url,
        category_id,
        pricing_model,
        nonprofit_deal: nonprofit_deal || null,
        features: features || [],
        submitted_by: user.id,
        status: 'pending', // Requires admin approval
        rating_avg: 0,
        review_count: 0,
      })
      .select()
      .single()

    if (insertError) {
      return createErrorResponse(insertError.message, 500)
    }

    return createSuccessResponse(
      newTool,
      201,
      'Tool submitted successfully and is pending admin approval'
    )
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}
