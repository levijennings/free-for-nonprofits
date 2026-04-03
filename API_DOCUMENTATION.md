# Free For NonProfits - API Documentation

## Overview

This document describes the complete API routes and server actions for the Free For NonProfits application. All routes use Next.js 14 Route Handlers with Supabase as the backend database.

## Architecture

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Validation**: Zod schemas
- **Authentication**: Supabase Auth

## File Structure

```
src/
├── lib/
│   ├── validations.ts           # Zod schemas for input validation
│   ├── api-helpers.ts           # Shared API utilities and middleware
│   └── supabase/
│       ├── server.ts            # Server-side Supabase client
│       └── client.ts            # Browser Supabase client
├── app/api/
│   ├── tools/
│   │   ├── route.ts             # GET all tools, POST new tool
│   │   ├── [id]/route.ts        # GET single tool, PATCH update, DELETE
│   │   └── search/route.ts      # GET full-text search
│   ├── reviews/
│   │   ├── route.ts             # GET reviews, POST new review
│   │   └── [id]/route.ts        # PATCH update review, DELETE review
│   ├── categories/
│   │   └── route.ts             # GET categories with tool counts
│   ├── saved-tools/
│   │   └── route.ts             # GET, POST, DELETE saved tools
│   ├── profile/
│   │   └── route.ts             # GET user profile, PATCH update
│   └── admin/
│       └── tools/route.ts       # GET pending tools, PATCH approve/reject
└── types/
    └── index.ts                 # TypeScript type definitions
```

## Validation Schemas

### toolSubmissionSchema
```typescript
{
  name: string (3-100 chars)
  description: string (10-1000 chars)
  website_url: string (valid URL)
  category_id: string (UUID)
  pricing_model: 'free' | 'freemium' | 'nonprofit_discount'
  nonprofit_deal?: string (optional, 0-500 chars)
  features?: string[] (optional, 1-10 items, each 1-100 chars)
}
```

### reviewSchema
```typescript
{
  tool_id: string (UUID)
  rating: number (1-5)
  title: string (3-100 chars)
  body: string (10-2000 chars)
  org_size: 'small' | 'medium' | 'large'
}
```

### profileUpdateSchema
```typescript
{
  display_name?: string (2-100 chars)
  org_name?: string (2-100 chars)
  org_size?: 'small' | 'medium' | 'large'
}
```

### searchSchema
```typescript
{
  query: string (1-100 chars, required)
  category?: string (UUID, optional)
  pricing_model?: 'free' | 'freemium' | 'nonprofit_discount' (optional)
  sort?: 'relevance' | 'rating' | 'newest' (optional)
  page?: number (default: 1)
  limit?: number (default: 20, max: 100)
}
```

## API Endpoints

### Tools

#### GET /api/tools
List all tools with optional filtering and pagination.

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `category` (string, optional): Filter by category ID
- `pricing_model` (string, optional): Filter by 'free', 'freemium', or 'nonprofit_discount'

**Response**:
```json
{
  "success": true,
  "data": {
    "tools": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

**Status**: 200, 500

---

#### POST /api/tools
Submit a new tool (requires authentication).

**Request Body**:
```json
{
  "name": "Tool Name",
  "description": "Tool description",
  "website_url": "https://example.com",
  "category_id": "uuid",
  "pricing_model": "free",
  "nonprofit_deal": "Optional discount info",
  "features": ["Feature 1", "Feature 2"]
}
```

**Response** (201):
```json
{
  "success": true,
  "data": { /* tool object */ },
  "message": "Tool submitted successfully and is pending admin approval"
}
```

**Status**: 201, 400, 401, 500

---

#### GET /api/tools/[id]
Get a single tool with reviews.

**Parameters**:
- `id` (string): Tool UUID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Tool Name",
    "description": "...",
    "category": { "id": "uuid", "name": "...", "slug": "..." },
    "reviews": [...]
  }
}
```

**Status**: 200, 400, 404, 500

---

#### PATCH /api/tools/[id]
Update a tool (admin only).

**Parameters**:
- `id` (string): Tool UUID

**Request Body**:
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "website_url": "https://updated.com",
  "logo_url": "https://logo.url",
  "nonprofit_deal": "Updated deal",
  "features": ["Feature 1"],
  "status": "approved"
}
```

**Status**: 200, 400, 403, 404, 500

---

#### DELETE /api/tools/[id]
Delete a tool (admin only, cascades to reviews).

**Parameters**:
- `id` (string): Tool UUID

**Status**: 200, 403, 404, 500

---

#### GET /api/tools/search
Full-text search with filtering.

**Query Parameters**:
- `query` (string, required): Search term (1-100 chars)
- `category` (string, optional): Category UUID
- `pricing_model` (string, optional): 'free', 'freemium', or 'nonprofit_discount'
- `sort` (string, optional): 'relevance', 'rating', or 'newest'
- `page` (number, optional): Default 1
- `limit` (number, optional): Default 20, max 100

**Response**:
```json
{
  "success": true,
  "data": {
    "query": "search term",
    "tools": [...],
    "pagination": { ... }
  }
}
```

**Status**: 200, 400, 500

---

### Reviews

#### GET /api/reviews
List reviews with optional tool filter.

**Query Parameters**:
- `tool_id` (string, optional): Filter by tool UUID
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

**Response**:
```json
{
  "success": true,
  "data": {
    "reviews": [...],
    "pagination": { ... }
  }
}
```

**Status**: 200, 500

---

#### POST /api/reviews
Create a new review (requires authentication, one per user per tool).

**Request Body**:
```json
{
  "tool_id": "uuid",
  "rating": 5,
  "title": "Great tool!",
  "body": "Detailed review text...",
  "org_size": "medium"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": { /* review object */ },
  "message": "Review created successfully"
}
```

**Status**: 201, 400, 401, 404, 500

---

#### PATCH /api/reviews/[id]
Update own review (authenticated user only).

**Parameters**:
- `id` (string): Review UUID

**Request Body**:
```json
{
  "rating": 4,
  "title": "Updated title",
  "body": "Updated review",
  "org_size": "large"
}
```

**Status**: 200, 400, 403, 404, 500

---

#### DELETE /api/reviews/[id]
Delete own review (authenticated user only).

**Parameters**:
- `id` (string): Review UUID

**Status**: 200, 403, 404, 500

---

### Categories

#### GET /api/categories
List all categories with tool counts.

**Response**:
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Category Name",
        "slug": "category-name",
        "description": "...",
        "icon": "emoji",
        "tool_count": 15
      }
    ],
    "total": 8
  }
}
```

**Status**: 200, 500

---

### Saved Tools

#### GET /api/saved-tools
Get current user's saved tools (requires authentication).

**Query Parameters**:
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

**Response**:
```json
{
  "success": true,
  "data": {
    "tools": [...],
    "pagination": { ... }
  }
}
```

**Status**: 200, 401, 500

---

#### POST /api/saved-tools
Save a tool (requires authentication).

**Request Body**:
```json
{
  "tool_id": "uuid"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": { /* saved_tool object */ },
  "message": "Tool saved successfully"
}
```

**Status**: 201, 400, 401, 404, 500

---

#### DELETE /api/saved-tools
Unsave a tool (requires authentication).

**Request Body**:
```json
{
  "tool_id": "uuid"
}
```

**Status**: 200, 400, 401, 500

---

### Profile

#### GET /api/profile
Get current user's profile (requires authentication).

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "John Doe",
    "org_name": "My Nonprofit",
    "org_size": "medium",
    "role": "user",
    "created_at": "2024-01-01T00:00:00Z",
    "saved_tools": ["uuid1", "uuid2"]
  }
}
```

**Status**: 200, 401, 404, 500

---

#### PATCH /api/profile
Update current user's profile (requires authentication).

**Request Body**:
```json
{
  "display_name": "Updated Name",
  "org_name": "Updated Org",
  "org_size": "large"
}
```

**Response**:
```json
{
  "success": true,
  "data": { /* updated profile */ }
}
```

**Status**: 200, 400, 401, 500

---

### Admin

#### GET /api/admin/tools
List pending and rejected tools for approval (admin only).

**Query Parameters**:
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

**Response**:
```json
{
  "success": true,
  "data": {
    "tools": [...],
    "pagination": { ... }
  }
}
```

**Status**: 200, 403, 500

---

#### PATCH /api/admin/tools
Approve or reject a tool submission (admin only).

**Request Body**:
```json
{
  "tool_id": "uuid",
  "status": "approved",
  "rejection_reason": "Optional reason if rejected"
}
```

**Response**:
```json
{
  "success": true,
  "data": { /* updated tool */ },
  "message": "Tool approved successfully"
}
```

**Status**: 200, 400, 403, 404, 500

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message"
}
```

**HTTP Status Codes**:
- `200` OK: Successful GET/PATCH/DELETE
- `201` Created: Successful POST
- `400` Bad Request: Validation error or invalid input
- `401` Unauthorized: Authentication required or invalid
- `403` Forbidden: Insufficient permissions (admin-only endpoints)
- `404` Not Found: Resource not found
- `500` Internal Server Error: Database or server error

---

## Authentication

All endpoints that require authentication use Supabase Auth. The authenticated user is retrieved from the session cookie set by the Supabase client.

**Admin Routes**:
- `PATCH /api/tools/[id]`
- `DELETE /api/tools/[id]`
- `GET /api/admin/tools`
- `PATCH /api/admin/tools`

**Authenticated Routes**:
- `POST /api/tools` (can submit, but tool is pending approval)
- `POST /api/reviews`
- `PATCH /api/reviews/[id]`
- `DELETE /api/reviews/[id]`
- `GET /api/saved-tools`
- `POST /api/saved-tools`
- `DELETE /api/saved-tools`
- `GET /api/profile`
- `PATCH /api/profile`

---

## Key Features

### Automatic Rating Calculation
When a review is created, updated, or deleted, the tool's `rating_avg` and `review_count` are automatically recalculated.

### Tool Approval Workflow
1. User submits tool via `POST /api/tools`
2. Tool is created with `status: 'pending'`
3. Admin retrieves pending tools via `GET /api/admin/tools`
4. Admin approves or rejects via `PATCH /api/admin/tools`
5. Tool becomes available when `status: 'approved'`

### Saved Tools
Users can build personalized collections of tools without affecting the main database.

### Full-Text Search
The search endpoint supports pattern matching on tool names and descriptions, with optional filtering by category and pricing model.

---

## Helper Functions (api-helpers.ts)

### createErrorResponse(error, status)
Creates a standardized error response.

### createSuccessResponse(data, status, message)
Creates a standardized success response.

### requireAuth(request)
Middleware helper to check authentication and return user.

### requireAdmin(request)
Middleware helper to check admin access.

### parsePagination(searchParams)
Parses and validates pagination parameters.

### getSearchParams(request)
Extracts all query parameters from request.

---

## Database Tables Used

- `tools` - Main tool listings
- `categories` - Tool categories
- `reviews` - User reviews for tools
- `profiles` - User profiles
- `saved_tools` - User-saved tools (many-to-many junction)

---

## Example Usage

### Submit a new tool
```bash
curl -X POST http://localhost:3000/api/tools \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Tool",
    "description": "A great nonprofit tool",
    "website_url": "https://mytool.com",
    "category_id": "category-uuid",
    "pricing_model": "free",
    "features": ["Feature 1", "Feature 2"]
  }'
```

### Search tools
```bash
curl "http://localhost:3000/api/tools/search?query=nonprofit&pricing_model=free&sort=rating&page=1"
```

### Create a review
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "tool-uuid",
    "rating": 5,
    "title": "Excellent tool",
    "body": "Detailed review...",
    "org_size": "medium"
  }'
```

### Approve a tool (admin)
```bash
curl -X PATCH http://localhost:3000/api/admin/tools \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "tool-uuid",
    "status": "approved"
  }'
```

---

## Notes

- All IDs are UUIDs and are validated before use
- All timestamps are in ISO 8601 format
- All string inputs are validated for length and format
- Authentication uses Supabase Auth session cookies
- Pagination defaults to 20 items per page, max 100
- Tools require admin approval before appearing in public lists
