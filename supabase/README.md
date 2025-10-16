# Supabase Database Migrations

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended for now)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the migration file: `migrations/001_user_sites.sql`
4. Copy the entire content
5. Paste into the SQL Editor
6. Click **Run** to execute

### Option 2: Supabase CLI (Future)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Migrations

### 001_user_sites.sql

Creates tables for user interactions with heritage sites:

- `user_visits` - Sites the user has visited
- `user_wishlist` - Sites the user wants to visit
- `user_bookmarks` - Sites the user has bookmarked

Includes:

- Row Level Security (RLS) policies
- Indexes for performance
- Auto-updating timestamps
- Data validation constraints
