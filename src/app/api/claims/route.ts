import { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-helpers'
import { claimUpsertSchema } from '@/lib/validations'
import { resolveAppliedAt } from '@/lib/claims'

/**
 * GET /api/claims — every claim the signed-in user has started.
 *
 * RLS already scopes tool_claims to the caller; the explicit user_id filter is
 * belt and braces, not the security boundary.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { data, error } = await supabase
      .from('tool_claims')
      .select(
        'tool_id, status, note, applied_at, created_at, updated_at, tool:tools(id, name, slug, logo_url, website_url)'
      )
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      return createErrorResponse(error.message, 500)
    }

    return createSuccessResponse({ claims: data ?? [] })
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}

/**
 * PUT /api/claims — upsert the caller's claim state for one tool.
 *
 * Idempotent by (user, tool): the unique constraint is the merge key, so a
 * double-submit from a slow phone cannot produce two competing claim rows.
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return createErrorResponse('Invalid JSON body', 400)
    }

    let input
    try {
      input = claimUpsertSchema.parse(body)
    } catch (error) {
      if (error instanceof ZodError) {
        return createErrorResponse(
          error.errors[0]?.message ?? 'Invalid request',
          400
        )
      }
      throw error
    }

    // The tool has to exist — a claim against a deleted row would fail on the
    // foreign key with an opaque 500 otherwise.
    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .select('id')
      .eq('id', input.tool_id)
      .maybeSingle()

    if (toolError) return createErrorResponse(toolError.message, 500)
    if (!tool) return createErrorResponse('Tool not found', 404)

    // Read the existing row so applied_at can be derived from the transition
    // rather than trusted from the client.
    const { data: existing } = await supabase
      .from('tool_claims')
      .select('applied_at')
      .eq('user_id', user.id)
      .eq('tool_id', input.tool_id)
      .maybeSingle()

    const { data: claim, error: upsertError } = await supabase
      .from('tool_claims')
      .upsert(
        {
          user_id: user.id,
          tool_id: input.tool_id,
          status: input.status,
          note: input.note?.trim() ? input.note.trim() : null,
          applied_at: resolveAppliedAt(input.status, existing?.applied_at ?? null),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,tool_id' }
      )
      .select('tool_id, status, note, applied_at, created_at, updated_at')
      .single()

    if (upsertError) {
      return createErrorResponse(upsertError.message, 500)
    }

    return createSuccessResponse(claim, 200, 'Claim status saved')
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}
