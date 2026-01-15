# Supabase Migration Guide - Member Management Integration

This guide walks you through setting up Supabase database for the Wellness Center member management system.

---

## Prerequisites

- Supabase project already created
- Supabase credentials in `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```

---

## Step 1: Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click on "SQL Editor" in the left sidebar

2. **Run Members Table Migration**
   - Click "New Query"
   - Copy contents from `supabase/migrations/001_create_members_table.sql`
   - Paste into SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - ✅ You should see: "Success. No rows returned"

3. **Create Storage Bucket (Dashboard UI)**
   - Click "Storage" in the left sidebar
   - Click "New bucket" button
   - Enter bucket name: **member-images**
   - Set as **Public bucket** (toggle ON)
   - Click "Create bucket"
   - ✅ You should see the new bucket in the list

4. **Configure Bucket Settings**
   - Click on the `member-images` bucket
   - Click the settings gear icon
   - Set **File size limit**: 5 MB (5242880 bytes)
   - Set **Allowed MIME types**: 
     ```
     image/jpeg
     image/jpg
     image/png
     image/webp
     ```
   - Click "Save"

5. **Run Storage Policies Migration**
   - Go back to "SQL Editor"
   - Click "New Query"
   - Copy contents from `supabase/migrations/002_create_storage_bucket.sql`
   - Paste into SQL Editor
   - Click "Run"
   - ✅ You should see: "Success. No rows returned"

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

---

## Step 2: Verify Database Setup

### Check Members Table

Go to "Table Editor" in Supabase Dashboard:
- ✅ You should see a new table called `members`
- ✅ Click on it to see the columns:
  - id, user_id, first_name, last_name, email, image, date_of_birth
  - date_joined, status, archived_at, created_at, updated_at

### Check RLS Policies

Go to "Authentication" → "Policies":
- ✅ You should see 4 policies for `members` table:
  - "Authenticated users can read members"
  - "Authenticated users can create members"
  - "Authenticated users can update members"
  - "Authenticated users can delete members"

### Check Indexes

Run this query in SQL Editor to verify indexes:
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'members';
```

✅ You should see 5 indexes:
- idx_members_status
- idx_members_email
- idx_members_date_joined
- idx_members_user_id
- idx_members_search

---

## Step 3: Verify Storage Setup

### Check Storage Bucket

1. **Go to Storage in Dashboard**
   - Click "Storage" in left sidebar
   - ✅ You should see bucket: `member-images`

2. **Check Bucket Configuration**
   - Click on `member-images` bucket
   - Click "Settings" (gear icon)
   - ✅ Verify settings:
     - Public bucket: **Yes**
     - File size limit: **5 MB**
     - Allowed MIME types: **image/jpeg, image/jpg, image/png, image/webp**

3. **Check Storage Policies**
   - In Storage section, click "Policies"
   - ✅ You should see 4 policies for `member-images`:
     - "Authenticated users can upload member images"
     - "Public read access to member images"
     - "Authenticated users can update member images"
     - "Authenticated users can delete member images"

---

## Step 4: (Optional) Seed Test Data

If you want to populate with test data from mock data:

```sql
-- Insert test members (replace user_id with your actual user ID)
INSERT INTO public.members (
  user_id, first_name, last_name, email, date_of_birth, date_joined, status
) VALUES 
  ('your-user-id', 'Emma', 'Johnson', 'emma.johnson@example.com', '1992-05-20', '2024-01-15', 'active'),
  ('your-user-id', 'Michael', 'Chen', 'michael.chen@example.com', '1988-11-08', '2024-02-03', 'active'),
  ('your-user-id', 'Sarah', 'Williams', 'sarah.williams@example.com', '1995-07-14', '2024-03-12', 'active');

-- Verify insertion
SELECT * FROM public.members;
```

**Note:** Replace `'your-user-id'` with your actual authenticated user ID. You can get it by:
1. Log into your app
2. Run in browser console: 
   ```javascript
   const { data } = await supabase.auth.getUser()
   console.log(data.user.id)
   ```

---

## Step 5: Test Database Connection

Run this query in SQL Editor to test everything:

```sql
-- Test members table
SELECT 
  COUNT(*) as total_members,
  COUNT(*) FILTER (WHERE status = 'active') as active_members,
  COUNT(*) FILTER (WHERE status = 'archived') as archived_members
FROM public.members;

-- Test indexes exist
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE tablename = 'members';

-- Test RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'members';
```

✅ Expected results:
- Row security should be: `true`
- All indexes should be listed
- Counts should match your data (0 if no seed data)

---

## Step 6: Update Environment Variables (if needed)

Make sure your `.env.local` has all required variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Service role key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Security Note:** Never commit `.env.local` to git!

---

## Troubleshooting

### Issue: "relation 'members' already exists"
**Solution:** Table already created. Check "Table Editor" to verify structure.

### Issue: "permission denied for table members"
**Solution:** 
1. Check RLS policies are created
2. Verify user is authenticated
3. Run: `GRANT ALL ON public.members TO authenticated;`

### Issue: "bucket 'member-images' already exists"
**Solution:** Bucket already created. Check Storage section to verify.

### Issue: Cannot upload images
**Solution:**
1. Check bucket exists and is public
2. Verify storage policies are created
3. Check file size < 5MB
4. Check MIME type is allowed

---

## Next Steps

After completing this setup, proceed to:
1. ✅ **Integration Phase:** Update API routes to use Supabase
2. ✅ **Testing Phase:** Test all CRUD operations
3. ✅ **Migration Phase:** Migrate image uploads to Supabase Storage

---

## Verification Checklist

Before proceeding to integration:

- [ ] ✅ Members table created with all columns
- [ ] ✅ RLS policies enabled and created (4 policies)
- [ ] ✅ Indexes created (5 indexes)
- [ ] ✅ Timestamp trigger working
- [ ] ✅ Storage bucket created (`member-images`)
- [ ] ✅ Storage policies created (4 policies)
- [ ] ✅ Environment variables set correctly
- [ ] ✅ Test query runs successfully

---

## Support

If you encounter issues:
1. Check Supabase Dashboard logs (Settings → API → Logs)
2. Verify RLS policies match authenticated user
3. Check browser console for errors
4. Review Supabase documentation: https://supabase.com/docs

---

**Ready to integrate? Proceed to the API integration phase!**
