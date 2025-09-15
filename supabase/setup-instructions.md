# Database Setup Instructions

## For Development Setup (Quick Start)

Run these SQL files in your Supabase SQL Editor in this exact order:

### Step 1: Create Schema
```sql
-- Copy and paste the contents of: 001_initial_schema.sql
```

### Step 2: Set up Security
```sql
-- Copy and paste the contents of: 002_rls_policies.sql
```

### Step 3: Add Development Data
```sql
-- Copy and paste the contents of: 004_development_data.sql
```

The development data script will:
- ✅ Create sample profiles, projects, and contributors
- ✅ Temporarily disable foreign key constraints for testing
- ✅ Give you working data to test the frontend immediately

## For Production Setup

### Step 1 & 2: Same as above
Run `001_initial_schema.sql` and `002_rls_policies.sql`

### Step 3: Create Real Users
1. Go to Supabase Dashboard → Authentication → Users
2. Create real user accounts (or use the auth API)
3. Profiles will be created automatically via triggers
4. Add real projects through your application

### Step 4: Optional - View Sample Structure
```sql
-- Copy and paste the contents of: 003_sample_data.sql
-- (This just shows you the data structure - doesn't insert anything)
```

## Database Tables Created

- ✅ `profiles` - User profiles with skills, bio, role
- ✅ `projects` - Club projects with tech stack, status
- ✅ `project_contributors` - Many-to-many with contribution percentages
- ✅ Row Level Security (RLS) policies for all tables
- ✅ Automatic profile creation trigger

## Test Login Credentials (Development Only)

After running the development data, you can use these for frontend testing:
- Username: `admin_dev` (Admin role)
- Username: `alice_dev` (Member role)
- Username: `bob_ml_dev` (Member role)

**Note**: These won't work for actual login since they're not real auth users - they're just database records for frontend development.

## Next Steps

1. Update your `.env.local` with your Supabase credentials
2. Run `npm run dev` to start the application
3. The frontend will display the sample projects and members
4. For real authentication, create actual users through Supabase Auth