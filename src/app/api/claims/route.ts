import { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-helpers'
import { claimUpsertSchema } from '@/lib/validations'
import { resolveAppliedAt } from '@/lib/claims'

/** Matches the uuid check the upsert schema applies to tool_id. */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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
 * DELETE /api/claims?tool_id=… — drop the caller's claim for one tool.
 *
 * A claim started on the wrong tool was previously permanent: the API could
 * create and update, never remove, so the only exit was to leave a false row
 * on the dashboard forever.
 *
 * RLS already scopes tool_claims to the caller, but the delete is filtered on
 * user_id explicitly as well, so ownership does not rest on a policy alone.
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const toolId = request.nextUrl.searchParams.get('tool_id')
    if (!toolId) {
      return createErrorResponse('tool_id is required', 400)
    }
    if (!UUID_PATTERN.test(toolId)) {
      return createErrorResponse('Invalid tool ID', 400)
    }

    const { data: deleted, error: deleteError } = await supabase
      .from('tool_claims')
      .delete()
      .eq('user_id', user.id)
      .eq('tool_id', toolId)
      .select('tool_id')

    if (deleteError) {
      return createErrorResponse(deleteError.message, 500)
    }

    // Nothing matched: either no such claim, or it belongs to someone else.
    // Both are the same answer to this caller.
    if (!deleted || deleted.length === 0) {
      return createErrorResponse('Claim not found', 404)
    }

    return createSuccessResponse({ tool_id: toolId }, 200, 'Claim removed')
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
