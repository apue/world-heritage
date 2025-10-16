# Deployment Guide - User Sites Feature

## 📋 Pre-Deployment Checklist

### 1. Database Setup (Supabase)

**IMPORTANT**: You must run the database migration before the app will work!

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Open the migration file: `supabase/migrations/001_user_sites.sql`
4. Copy and paste the entire SQL content into the editor
5. Click **Run** to execute

This will create:

- ✅ `user_visits` table
- ✅ `user_wishlist` table
- ✅ `user_bookmarks` table
- ✅ RLS (Row Level Security) policies
- ✅ Indexes for performance
- ✅ Automatic timestamp triggers

### 2. Verify Environment Variables

Ensure these are set in your `.env.local` (and Vercel):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Test Locally First

```bash
npm run dev
```

Visit http://localhost:3000 and test:

1. **Authentication**: Sign in with Google OAuth
2. **Map markers**: Check if colors change when you mark sites as visited/wishlist/bookmark
3. **Detail page**: Test action buttons
4. **User menu**: Verify statistics show up correctly
5. **Optimistic updates**: Try toggling buttons multiple times quickly

## 🧪 Testing Checklist

### Basic Functionality

- [ ] User can sign in with Google OAuth
- [ ] Action buttons appear on heritage detail page
- [ ] Action buttons work (toggle visited/wishlist/bookmark)
- [ ] Statistics show in user menu dropdown
- [ ] Map markers show correct colors based on status

### Edge Cases

- [ ] Buttons don't show when not logged in
- [ ] Error handling works (disconnect internet and try to toggle)
- [ ] Rollback works when database update fails
- [ ] Marking as visited removes from wishlist automatically
- [ ] Map updates in real-time when toggling from detail page

### Performance

- [ ] Initial load is fast (< 3 seconds)
- [ ] No duplicate network requests
- [ ] Map renders smoothly with 1000+ markers

## 🚀 Deployment to Vercel

### Option 1: Automatic Deployment (Recommended)

1. Push code to GitHub:

```bash
git add .
git commit -m "feat: add visited/wishlist/bookmark feature"
git push origin main
```

2. Vercel will automatically deploy

### Option 2: Manual Deployment

```bash
vercel --prod
```

## 🔍 Post-Deployment Verification

1. Visit your production site
2. Open browser console (F12)
3. Check for errors
4. Test the entire flow:
   - Sign in
   - Visit a heritage detail page
   - Toggle visited/wishlist/bookmark
   - Check map for color changes
   - Open user menu and verify stats

## 🐛 Troubleshooting

### Issue: Buttons don't appear

**Solution**: Make sure UserSitesProvider is wrapped in layout.tsx

### Issue: Database errors (401/403)

**Solution**:

1. Check Supabase RLS policies are enabled
2. Verify environment variables are set correctly
3. Run the migration SQL again

### Issue: Map markers don't update

**Solution**:

1. Check browser console for errors
2. Verify `sitesStatus` is updating in UserSitesContext
3. Clear browser cache

### Issue: "User not logged in" errors

**Solution**:

1. Check Google OAuth configuration in Supabase
2. Verify redirect URLs include your domain
3. Check middleware.ts is refreshing tokens

## 📊 Monitoring

After deployment, monitor:

1. **Supabase Dashboard** → Database → Tables
   - Check if data is being inserted
   - Verify RLS policies are working

2. **Vercel Analytics** (if enabled)
   - Page load times
   - Error rates

3. **Browser Console**
   - Look for JavaScript errors
   - Check network requests

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ Users can sign in with Google
- ✅ Users can mark sites as visited/wishlist/bookmark
- ✅ Map shows correct colored markers
- ✅ Statistics update in real-time
- ✅ No console errors
- ✅ Database queries are fast (< 500ms)

## 🔄 Future Updates

When updating this feature:

1. Test locally first
2. Create a new migration file if changing database schema
3. Deploy to preview environment (Vercel preview deployments)
4. Verify preview works correctly
5. Merge to main for production deployment

---

**Need Help?**

- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Project Issues: https://github.com/apue/world-heritage/issues
