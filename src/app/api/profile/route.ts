import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { profileUpdateSchema } from '@/lib/validations'
import {
  createErrorResponse,
  createSuccessResponse,
  requireAuth,
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

    // Get user profile with saved tools
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(
        `
        id,
        email,
        display_name,
        org_name,
        org_size,
        role,
        created_at,
        saved_tools(tool_id)
      `
      )
      .eq('id', user.id)
      .single()

    if (profileError) {
      return createErrorResponse('Profile not found', 404)
    }

    // Extract saved tool IDs
    const savedToolIds = (profile.saved_tools || []).map((st: any) => st.tool_id)

    return createSuccessResponse({
      ...profile,
      saved_tools: savedToolIds,
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
    const validationResult = profileUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors
      return createErrorResponse(
        `Validation error: ${JSON.stringify(errors)}`,
        400
      )
    }

    const updateData: Record<string, any> = {}

    if (validationResult.data.display_name && validationResult.data.display_name !== '') {
      updateData.display_name = validationResult.data.display_name
    }

    if (validationResult.data.org_name && validationResult.data.org_name !== '') {
      updateData.org_name = validationResult.data.org_name
    }

    if (validationResult.data.org_size && validationResult.data.org_size !== '') {
      updateData.org_size = validationResult.data.org_size
    }

    if (Object.keys(updateData).length === 0) {
      return createErrorResponse('No valid fields to update', 400)
    }

    // Update profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select(
        `
        id,
        email,
        display_name,
        org_name,
        org_size,
        role,
        created_at,
        saved_tools(tool_id)
      `
      )
      .single()

    if (updateError) {
      return createErrorResponse(updateError.message, 500)
    }

    // Extract saved tool IDs
    const savedToolIds = (updatedProfile.saved_tools || []).map((st: any) => st.tool_id)

    return createSuccessResponse({
      ...updatedProfile,
      saved_tools: savedToolIds,
    })
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}
