import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { paginationSchema } from '@/lib/validations'

export interface ApiResponse<T = null> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export function createErrorResponse(
  error: string | Error,
  status: number = 500
): NextResponse<ApiResponse> {
  const message = error instanceof Error ? error.message : error
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  )
}

export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  )
}

export async function requireAuth(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return { user: null, error: 'Unauthorized' }
    }

    return { user, error: null }
  } catch (error) {
    return { user: null, error: 'Authentication failed' }
  }
}

export async function requireAdmin(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return { user: null, isAdmin: false, error: 'Unauthorized' }
    }

    // Check if user has admin role in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = !profileError && profile?.role === 'admin'

    return { user, isAdmin, error: isAdmin ? null : 'Forbidden: Admin access required' }
  } catch (error) {
    return { user: null, isAdmin: false, error: 'Authentication failed' }
  }
}

export function parsePagination(searchParams: Record<string, string | string[] | undefined>) {
  try {
    const validated = paginationSchema.parse({
      page: searchParams.page,
      limit: searchParams.limit,
    })
    const offset = (validated.page - 1) * validated.limit
    return { page: validated.page, limit: validated.limit, offset }
  } catch {
    return { page: 1, limit: 20, offset: 0 }
  }
}

export function getSearchParams(request: NextRequest): Record<string, string | string[] | undefined> {
  const params: Record<string, string | string[] | undefined> = {}
  request.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value
  })
  return params
}
