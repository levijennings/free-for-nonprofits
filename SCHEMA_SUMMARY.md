# Free For NonProfits - Database Schema

## Overview
Production-quality PostgreSQL/Supabase schema for a nonprofit software directory application.

## Files
- `supabase/migrations/00001_initial_schema.sql` - Main migration with all tables, functions, triggers, and RLS
- `supabase/seed.sql` - Sample categories and tools for testing

## Key Features

### Tables (6 total)
1. **profiles** - User profiles extending auth.users
2. **categories** - Software categories (CRM, Fundraising, etc.)
3. **tools** - Directory entries with full-text search
4. **reviews** - User ratings and reviews
5. **saved_tools** - User bookmarks
6. (Implicit) **auth.users** - Supabase authentication

### Database Functions
- `update_updated_at()` - Auto-updates timestamp columns
- `update_tool_rating()` - Recalculates rating_avg and review_count
- `update_tool_search_vector()` - Maintains full-text search index
- `handle_new_user()` - Creates profile on signup

### Triggers
- Auto-update timestamps on profiles, tools, reviews
- Recalculate tool ratings after review changes
- Maintain search vectors automatically
- Create user profiles on signup

### Row-Level Security (RLS)
Comprehensive RLS policies:
- **profiles**: Users read all, update own
- **categories**: Public read, admin write
- **tools**: Public read verified, authenticated submit, admin approve
- **reviews**: Public read verified, authenticated CRUD own
- **saved_tools**: Users CRUD own only

### Enums
- `user_role` (user, admin, moderator)
- `org_size` (small, medium, large)
- `pricing_model` (free, freemium, nonprofit_discount)

### Indexes
- Full-text search on tools (GIN)
- Category, rating, and slug lookups
- Review and saved tool queries
- Composite indexes for common filters

## Seed Data
12 categories with 10 sample tools including:
- Salesforce Nonprofit Cloud
- Donorbox
- Mailchimp
- Asana
- Wave Accounting
- Wix for Nonprofits
- Slack
- Canva
- Google Workspace
- Microsoft 365

All seeded tools are marked as verified and ready for production use.

## Security Features
- Supabase RLS policies on all tables
- Cascade deletes for data integrity
- Check constraints on enums and ratings
- Unique constraints to prevent duplicates
- SECURITY DEFINER functions for admin operations

## Usage

### Deploy Migration
```bash
supabase db push
# or in Supabase Dashboard: SQL Editor > run 00001_initial_schema.sql
```

### Load Seed Data
```bash
# Run in Supabase Dashboard SQL Editor
# or via psql if self-hosted
psql -U postgres -d your_db -f seed.sql
```

## Schema Statistics
- Migration file: 477 lines
- Seed file: 234 lines
- Total: 711 lines of production SQL
