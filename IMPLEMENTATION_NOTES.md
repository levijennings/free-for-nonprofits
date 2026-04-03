# Implementation Notes

## Summary

This document provides implementation notes and guidance for the Free For NonProfits API routes.

## Files Created

### 1. `/src/lib/validations.ts`
Zod schema definitions for all input validation:
- `toolSubmissionSchema` - Tool creation/submission validation
- `reviewSchema` - Review creation validation
- `profileUpdateSchema` - User profile updates
- `searchSchema` - Search query validation with pagination
- `paginationSchema` - Pagination parameter validation

All schemas include:
- Type-safe string length limits
- UUID format validation
- Enum validation for pricing models and org sizes
- Optional field handling with `.optional().or(z.literal(''))`

### 2. `/src/lib/api-helpers.ts`
Shared utilities and middleware helpers:
- `createErrorResponse()` - Standardized error response formatting
- `createSuccessResponse()` - Standardized success response with optional message
- `requireAuth()` - Authentication middleware (returns user or null)
- `requireAdmin()` - Admin access check (validates role in profiles table)
- `parsePagination()` - Extracts and validates page/limit parameters
- `getSearchParams()` - Helper to extract all query parameters from request

### 3. `/src/app/api/tools/route.ts`
Main tools endpoint:
- **GET**: List tools with filtering by category and pricing model, includes pagination
- **POST**: Submit new tool (requires auth, status defaults to 'pending' for admin approval)
- Validates duplicate tool names
- Joins with categories table for full category info

### 4. `/src/app/api/tools/[id]/route.ts`
Single tool endpoint:
- **GET**: Fetch tool with full category info and reviews (includes reviewer display names)
- **PATCH**: Admin-only update (allows updating name, description, website_url, logo_url, nonprofit_deal, features, status)
- **DELETE**: Admin-only delete (cascades to reviews via FK constraint)
- UUID format validation on all requests

### 5. `/src/app/api/tools/search/route.ts`
Full-text search endpoint:
- **GET**: Search tools by name/description using `ilike` pattern matching
- Supports filters: category, pricing_model
- Sorting options: relevance (default), rating, newest
- Case-insensitive search using `%query%` syntax

### 6. `/src/app/api/reviews/route.ts`
Reviews listing and creation:
- **GET**: List reviews with optional tool_id filter, includes reviewer profiles
- **POST**: Create review (requires auth, enforces one-per-user-per-tool rule)
- Automatically recalculates tool rating average and review count
- Returns reviewer display names in response

### 7. `/src/app/api/reviews/[id]/route.ts`
Individual review endpoint:
- **PATCH**: Update own review only (user ownership check via user_id comparison)
- **DELETE**: Delete own review with automatic tool rating recalculation
- Handles edge case when all reviews deleted (sets rating_avg and review_count to 0)

### 8. `/src/app/api/categories/route.ts`
Categories listing:
- **GET**: List all categories with tool counts
- Orders by name alphabetically
- Formats response with `tool_count` field derived from related tools

### 9. `/src/app/api/saved-tools/route.ts`
User's saved tools collection:
- **GET**: List user's saved tools with pagination (requires auth)
- **POST**: Save a tool (requires auth, prevents duplicates)
- **DELETE**: Unsave a tool (requires auth)
- Validates tool existence before saving
- Returns full tool details in response

### 10. `/src/app/api/profile/route.ts`
User profile management:
- **GET**: Get current user profile with saved tools list (requires auth)
- **PATCH**: Update profile fields (requires auth)
- Returns saved_tools as array of UUIDs
- Validates all fields via schema

### 11. `/src/app/api/admin/tools/route.ts`
Admin tool approval workflow:
- **GET**: List pending and rejected tools (admin only)
- **PATCH**: Approve or reject tool submission (admin only)
- Prevents re-approval of already-approved tools
- Supports optional rejection_reason field

## Database Schema Assumptions

The implementation assumes these tables exist in Supabase:

```sql
-- tools table
CREATE TABLE tools (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  website_url TEXT NOT NULL,
  logo_url TEXT,
  category_id UUID REFERENCES categories(id),
  pricing_model TEXT CHECK (pricing_model IN ('free', 'freemium', 'nonprofit_discount')),
  nonprofit_deal TEXT,
  features TEXT[],
  rating_avg DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  rejection_reason TEXT,
  submitted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  org_size TEXT CHECK (org_size IN ('small', 'medium', 'large')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tool_id, user_id) -- One review per user per tool
);

-- profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  display_name TEXT,
  org_name TEXT,
  org_size TEXT CHECK (org_size IN ('small', 'medium', 'large')),
  role TEXT DEFAULT 'user', -- 'user' or 'admin'
  created_at TIMESTAMP DEFAULT NOW()
);

-- saved_tools table (junction table)
CREATE TABLE saved_tools (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);
```

## Key Implementation Details

### Error Handling
- All routes wrap business logic in try-catch blocks
- Errors return JSON with `success: false` and `error` message
- Validation errors include field details
- Database errors return 500 status with error message

### Authentication Flow
1. Routes call `supabase.auth.getUser()` to get current user from session
2. Admin check verifies `role === 'admin'` in profiles table
3. Ownership checks compare `user_id` fields for reviews

### Pagination
- Default page: 1, default limit: 20, max limit: 100
- Offset calculation: `(page - 1) * limit`
- Returns `totalPages` calculated as `Math.ceil(total / limit)`
- Uses Supabase's `.range()` method with `{ count: 'exact' }`

### Rating Recalculation
When reviews are created/updated/deleted:
```typescript
const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
const roundedRating = Math.round(avgRating * 10) / 10 // Round to 1 decimal place
```

### UUID Validation
All ID parameters validated with regex:
```typescript
if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
  return createErrorResponse('Invalid ID format', 400)
}
```

### Tool Approval Workflow
1. New tools submitted via POST /api/tools get `status: 'pending'`
2. Admin retrieves pending tools via GET /api/admin/tools
3. Admin updates status to 'approved' or 'rejected' via PATCH /api/admin/tools
4. GET /api/tools only shows approved tools (filter by status if needed)

## Configuration Required

### Environment Variables
The project needs these Supabase environment variables (already configured):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Supabase Setup
1. Create all tables as shown in schema above
2. Set up foreign key relationships
3. Create unique constraints for:
   - Tools name
   - Reviews (tool_id, user_id)
   - Saved tools (user_id, tool_id)
4. Set up Row-Level Security (RLS) policies if needed
5. Create admin user with `role: 'admin'` in profiles table

## Testing Recommendations

### Test Cases to Implement

1. **Tools Endpoint**
   - GET /api/tools with no filters
   - GET /api/tools with category filter
   - GET /api/tools with pricing_model filter
   - GET /api/tools with pagination
   - POST /api/tools with valid data (requires auth)
   - POST /api/tools with invalid data
   - POST /api/tools with duplicate name

2. **Tool Detail Endpoint**
   - GET /api/tools/[id] with valid id
   - GET /api/tools/[id] with invalid uuid format
   - GET /api/tools/[id] with non-existent id
   - PATCH /api/tools/[id] as admin
   - PATCH /api/tools/[id] as non-admin (should fail)
   - DELETE /api/tools/[id] as admin

3. **Search Endpoint**
   - GET /api/tools/search with query
   - GET /api/tools/search with category filter
   - GET /api/tools/search with pricing_model filter
   - GET /api/tools/search with sort options

4. **Reviews**
   - POST /api/reviews (requires auth)
   - POST /api/reviews with duplicate user+tool (should fail)
   - PATCH /api/reviews/[id] as review author
   - PATCH /api/reviews/[id] as different user (should fail)
   - DELETE /api/reviews/[id]
   - Verify rating average updates after review changes

5. **Admin Workflow**
   - POST /api/tools creates pending tool
   - GET /api/admin/tools shows pending tools
   - PATCH /api/admin/tools to approve
   - PATCH /api/admin/tools to reject with reason

6. **Authentication**
   - All auth-required endpoints reject requests without auth
   - Admin endpoints reject non-admin users

## Performance Considerations

1. **N+1 Query Prevention**
   - All routes use `.select()` to join related tables in single query
   - Category info fetched directly, not separately

2. **Pagination**
   - Always use pagination for list endpoints
   - Never return full dataset

3. **Indexes**
   - Consider adding indexes on:
     - `tools.category_id`
     - `tools.pricing_model`
     - `tools.status`
     - `reviews.tool_id`
     - `reviews.user_id`
     - `saved_tools.user_id`

4. **Caching**
   - Categories don't change often, could be cached
   - Tool details should be cacheable

## Security Considerations

1. **Authentication**
   - All protected endpoints verify user via Supabase Auth
   - Session cookies managed by Supabase SSR client

2. **Authorization**
   - Admin checks verify role in database (not trusting client)
   - Ownership checks prevent users from modifying others' content

3. **Input Validation**
   - All inputs validated with Zod before database operations
   - UUID formats validated before queries

4. **SQL Injection Prevention**
   - Supabase client uses parameterized queries
   - No string concatenation in queries

5. **Rate Limiting**
   - Should be implemented at middleware level (not in these routes)
   - Consider using Supabase Edge Functions with rate limiting

## Future Enhancements

1. Add real full-text search using PostgreSQL `tsvector`
2. Implement email notifications for tool submissions
3. Add tool favorites/bookmarks count to responses
4. Implement tool comparison feature
5. Add tag-based organization
6. Implement user reputation/badges
7. Add tool edit history tracking
8. Implement content moderation for reviews
9. Add analytics/view tracking for tools
10. Implement recommendation engine

## Debugging Tips

1. Enable Supabase logging to see actual SQL queries
2. Check Supabase dashboard for data consistency
3. Test with console.log statements to trace execution
4. Use Postman/Thunder Client for endpoint testing
5. Check network tab in browser DevTools for API responses
6. Verify authentication by checking Supabase Auth user sessions

## File Dependencies

- `validations.ts` - No external dependencies except Zod
- `api-helpers.ts` - Depends on Supabase server client and validations
- All route files - Depend on api-helpers, validations, and Supabase clients
- Routes follow Next.js 14 App Router conventions
