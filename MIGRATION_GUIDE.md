# Migration Guide - Free For NonProfits

## Quick Start

### 1. Deploy the Schema
```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Copy & paste supabase/migrations/00001_initial_schema.sql
# 3. Execute
```

### 2. Load Sample Data
```bash
# In Supabase Dashboard SQL Editor:
# Copy & paste supabase/seed.sql and execute
```

## What Gets Created

### Tables
| Table | Purpose |
|-------|---------|
| `auth.users` | Supabase authentication (implicit) |
| `profiles` | User profile data extending auth.users |
| `categories` | Tool categories (CRM, Fundraising, etc.) |
| `tools` | Software entries with search support |
| `reviews` | User ratings and written reviews |
| `saved_tools` | User bookmarks/favorites |

### Custom Types
- `user_role` enum: user, admin, moderator
- `org_size` enum: small, medium, large
- `pricing_model` enum: free, freemium, nonprofit_discount

### Automatic Functions
1. **update_updated_at()** - Maintains updated_at timestamps
2. **update_tool_rating()** - Recalculates ratings after review changes
3. **update_tool_search_vector()** - Maintains full-text search index
4. **handle_new_user()** - Creates profile when user signs up

### Security
Every table has Row-Level Security (RLS) enabled with these policies:

**profiles**
- SELECT: Public (anyone can view)
- UPDATE: Own profile only
- DELETE: Own profile only

**categories**
- SELECT: Public
- INSERT/UPDATE/DELETE: Admin only

**tools**
- SELECT: Verified or approved tools + own submissions + admins/moderators
- INSERT: Authenticated users (creates unverified entry)
- UPDATE: Own unverified entries OR admin/moderator
- DELETE: Admin/moderator only

**reviews**
- SELECT: Reviews on verified tools
- INSERT: Authenticated users
- UPDATE: Own reviews only
- DELETE: Own reviews only

**saved_tools**
- SELECT: Own bookmarks only
- INSERT: Own bookmarks only
- DELETE: Own bookmarks only

### Performance Indexes
```sql
-- Full-text search
CREATE INDEX idx_tools_search_vector ON tools USING GIN(search_vector);

-- Common queries
CREATE INDEX idx_tools_category_id ON tools(category_id);
CREATE INDEX idx_tools_slug ON tools(slug);
CREATE INDEX idx_tools_is_verified_featured ON tools(is_verified, is_featured);
CREATE INDEX idx_tools_rating_avg ON tools(rating_avg DESC);

-- Reviews and bookmarks
CREATE INDEX idx_reviews_tool_id ON reviews(tool_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_saved_tools_user_id ON saved_tools(user_id);
```

## Key Design Decisions

### Full-Text Search
- `tools.search_vector` is a tsvector that combines name, description, tags, and nonprofit_deal
- Automatically updated on INSERT/UPDATE via trigger
- Uses GIN index for fast full-text queries

### Referential Integrity
- CASCADE deletes on user-dependent data (profiles, reviews, saved_tools)
- SET NULL on optional foreign keys (category_id)
- Ensures data consistency without orphaned records

### Denormalization
- `rating_avg` and `review_count` on tools table (denormalized for performance)
- Automatically recalculated after every review change
- Avoids expensive aggregates on every query

### Pricing Models
Three distinct pricing models supported:
- **free**: No cost, completely open
- **freemium**: Free with optional paid features
- **nonprofit_discount**: Paid but discounted for nonprofits

### Organization Size
Used for filtering and relevance:
- **small**: 1-10 staff
- **medium**: 11-50 staff
- **large**: 50+

Reviewers indicate their org size so users can find relevant reviews.

## Seed Data

### Categories (12)
All 12 nonprofit software categories pre-loaded with emojis and display order.

### Sample Tools (10)
Real nonprofit tools demonstrating all features:
- Salesforce Nonprofit Cloud (nonprofit_discount)
- Donorbox (freemium)
- Mailchimp (free)
- Asana (nonprofit_discount)
- Wave Accounting (free)
- Wix for Nonprofits (free)
- Slack (freemium)
- Canva (freemium)
- Google Workspace (free)
- Microsoft 365 (free)

All marked as `is_verified = true` and appropriate `is_featured` values.

## Verification & Approval Workflow

1. **Submit** - User creates a tool entry (unverified, unapproved)
2. **Review** - Admin/moderator reviews the submission
3. **Approve** - Sets `approved_at` timestamp and `approved_by` user_id
4. **Verify** - Admin marks as `is_verified = true` (confirmed working)
5. **Feature** - Optional: set `is_featured = true` for homepage

Users can only view tools that are:
- Verified, OR
- Approved, OR
- Submitted by themselves (to review their draft), OR
- They are admin/moderator

## Constraints & Checks

```sql
-- Organization size validation
org_size org_size CHECK (org_size IN ('small', 'medium', 'large'))

-- Pricing model validation
pricing_model pricing_model NOT NULL

-- Review rating validation
rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5)

-- Unique constraints
UNIQUE(tool_id, user_id) -- one review per user per tool
UNIQUE(user_id, tool_id) -- one bookmark per user per tool
```

## Common Queries

### Get all verified tools with ratings
```sql
SELECT * FROM tools
WHERE is_verified = true
ORDER BY rating_avg DESC, review_count DESC;
```

### Search tools by keyword
```sql
SELECT * FROM tools
WHERE search_vector @@ plainto_tsquery('english', 'nonprofit')
AND is_verified = true;
```

### Get tools in a category
```sql
SELECT t.* FROM tools t
JOIN categories c ON t.category_id = c.id
WHERE c.slug = 'crm-donor-management'
AND t.is_verified = true;
```

### Get user's saved tools
```sql
SELECT t.* FROM saved_tools st
JOIN tools t ON st.tool_id = t.id
WHERE st.user_id = auth.uid()
ORDER BY st.created_at DESC;
```

## Troubleshooting

### Issue: RLS blocking legitimate queries
**Solution**: Ensure user is authenticated before accessing protected tables. Check RLS policies match your app's access model.

### Issue: Search not working
**Solution**: Verify `search_vector` column is populated. Run:
```sql
UPDATE tools SET search_vector = to_tsvector(
  'english',
  COALESCE(name, '') || ' ' ||
  COALESCE(description, '') || ' ' ||
  COALESCE(array_to_string(tags, ' '), '')
) WHERE search_vector IS NULL;
```

### Issue: Ratings not updating
**Solution**: Verify the `update_tool_rating()` trigger exists and is enabled.
```sql
SELECT * FROM pg_trigger WHERE tgname = 'trigger_reviews_update_rating';
```

## Next Steps

1. Deploy migration via `supabase db push`
2. Load seed data via SQL Editor
3. Test RLS policies by logging in with test users
4. Implement frontend queries using these RLS-protected tables
5. Set up admin panel for tool verification workflow
