import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get all categories with tool counts
    const { data: categories, error } = await supabase
      .from('categories')
      .select(
        `
        id,
        name,
        slug,
        description,
        icon,
        tools(count)
      `
      )
      .order('name', { ascending: true })

    if (error) {
      return createErrorResponse(error.message, 500)
    }

    // Format the response to include tool counts
    const formattedCategories = (categories || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      tool_count: cat.tools ? cat.tools.length : 0,
    }))

    return createSuccessResponse({
      categories: formattedCategories,
      total: formattedCategories.length,
    })
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}
