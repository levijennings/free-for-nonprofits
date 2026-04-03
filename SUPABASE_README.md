# Free For NonProfits - Supabase Database Setup

This directory contains a production-ready Supabase database migration for the Free For NonProfits nonprofit software directory.

## Quick Start

### 1. Deploy the Schema
```bash
# Using Supabase CLI (recommended)
supabase db push

# Or manually:
# - Go to Supabase Dashboard > SQL Editor
# - Create new query
# - Copy & paste the contents of supabase/migrations/00001_initial_schema.sql
# - Click Execute
```

### 2. Load Sample Data
```bash
# In Supabase Dashboard SQL Editor:
# - Create new query
# - Copy & paste the contents of supabase/seed.sql
# - Click Execute
```

### 3. Verify Deployment
In Supabase SQL Editor, run:
```sql
-- Check tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('profiles', 'categories', 'tools', 'reviews', 'saved_tools');

-- Test sample data
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM tools;
```

## Files in This Directory

### Database Files
- **supabase/migrations/00001_initial_schema.sql** (477 lines)
  - Main migration file with all tables, enums, functions, triggers, and RLS policies
  - Ready for immediate deployment
  - Includes comprehensive inline documentation

- **supabase/seed.sql** (234 lines)
  - 12 nonprofit software categories
  - 10 sample tools demonstrating all features
  - Run after migration to populate test data

### Documentation Files
- **SCHEMA_SUMMARY.md** - Quick reference for database objects and features
- **MIGRATION_GUIDE.md** - Detailed deployment guide with examples and troubleshooting
- **IMPLEMENTATION_SUMMARY.txt** - Complete overview of design decisions and architecture
- **SUPABASE_README.md** - This file

## Database Schema at a Glance

### Tables (5 + auth)
1. **profiles** - User profiles extending auth.users
2. **categories** - Software categories (CRM, Fundraising, etc.)
3. **tools** - Directory entries with full-text search
4. **reviews** - User ratings and written reviews
5. **saved_tools** - User bookmarks/favorites
6. **auth.users** - Supabase authentication (implicit)

### Key Features
- Full-text search on tools (PostgreSQL tsvector)
- Automatic rating calculation with triggers
- Row-Level Security (RLS) on all tables
- Audit trail (created_at, updated_at, approved_at)
- Automatic profile creation on user signup
- Cascade deletes for data integrity

### Security
- 19 RLS policies protecting data access
- Admin-only operations for moderation
- User can only CRUD their own content
- Verified tools separated from unverified submissions

### Performance
- 7 strategic indexes for fast queries
- Denormalized ratings to avoid aggregates
- GIN index for full-text search
- Optimized for millions of tools and reviews

## Common Tasks

### Add a New Tool Manually
```sql
INSERT INTO tools (
  name, slug, description, category_id, website_url,
  pricing_model, is_verified, is_featured
) VALUES (
  'Tool Name',
  'tool-slug',
  'Tool description here',
  (SELECT id FROM categories WHERE slug = 'category-slug'),
  'https://example.com',
  'free',
  true,
  false
);
```

### Search Tools
```sql
SELECT * FROM tools
WHERE search_vector @@ plainto_tsquery('english', 'your search term')
AND is_verified = true
ORDER BY rating_avg DESC;
```

### Get User's Saved Tools
```sql
SELECT t.* FROM saved_tools st
JOIN tools t ON st.tool_id = t.id
WHERE st.user_id = auth.uid()
ORDER BY st.created_at DESC;
```

### Approve a Tool Submission
```sql
UPDATE tools
SET approved_at = NOW(), approved_by = auth.uid(), is_verified = true
WHERE id = 'tool-id';
```

## RLS Policies

All tables have Row-Level Security enabled:

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| **profiles** | Public | Own | Own | Own |
| **categories** | Public | Admin | Admin | Admin |
| **tools** | Verified\* | Auth | Own\** | Admin |
| **reviews** | Public\*** | Auth | Own | Own |
| **saved_tools** | Own | Own | N/A | Own |

\* Verified OR approved OR own submission
\** Own unverified, or admin/moderator
\*** Reviews on verified tools only

## Performance Tips

1. **Search Operations**: Use the full-text search feature for keyword queries
2. **Ratings**: Rating_avg is denormalized - use it directly, don't aggregate
3. **Pagination**: Add LIMIT and OFFSET to large queries
4. **Filtering**: Use indexed columns (category_id, is_verified, rating_avg)
5. **Updates**: Bulk operations should be batched for efficiency

## Troubleshooting

### RLS Blocking Queries
Ensure user is authenticated. Check auth.uid() returns a value:
```sql
SELECT auth.uid();
```

### Search Not Working
Verify search_vector is populated:
```sql
SELECT COUNT(*) FROM tools WHERE search_vector IS NOT NULL;
```

### Ratings Not Updating
Check trigger is active:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'trigger_reviews_update_rating';
```

See **MIGRATION_GUIDE.md** for detailed troubleshooting.

## Next Steps

1. Deploy migration: `supabase db push`
2. Load seed data via SQL Editor
3. Test RLS policies with test users
4. Implement frontend to consume the API
5. Set up admin dashboard for tool moderation

## Support

- Check **MIGRATION_GUIDE.md** for common queries and troubleshooting
- See **SCHEMA_SUMMARY.md** for quick reference
- Review SQL comments in migration file for detailed documentation
- Supabase Docs: https://supabase.com/docs

## Production Checklist

- [ ] Migration deployed successfully
- [ ] Seed data loaded
- [ ] RLS policies verified working
- [ ] Backup strategy configured
- [ ] Full-text search tested
- [ ] Rating triggers verified
- [ ] Admin users created
- [ ] Frontend connected to API

## License

This database schema is provided as-is for the Free For NonProfits project.

---

**Created**: 2026-04-03  
**Status**: Production-Ready  
**Version**: 1.0
