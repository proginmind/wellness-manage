# Supabase Authentication Setup

This project uses Supabase for authentication and user management.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project in Supabase

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Getting Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Project Structure

### Supabase Client Files

```
src/lib/supabase/
├── client.ts      # Browser client for client components
├── server.ts      # Server client for server components
└── middleware.ts  # Middleware helper for auth
```

### Authentication Files

```
src/
├── middleware.ts                # Route protection middleware
├── app/
│   ├── login/page.tsx          # Login page
│   ├── dashboard/page.tsx      # Protected dashboard
│   └── auth/
│       └── signout/route.ts    # Sign out API route
```

## Features

### ✅ Implemented

- **Email/Password Authentication** - Sign in with email and password
- **Password Recovery** - Forgot password and reset functionality
- **Protected Routes** - Dashboard requires authentication
- **Auto-redirect** - Logged-in users redirected from /login to /dashboard
- **Session Management** - Automatic session refresh via middleware
- **Sign Out** - Secure sign out functionality

### 🔄 Usage

#### Client Components (Browser)

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";

export default function MyComponent() {
  const supabase = createClient();

  // Use supabase client
  const signIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "user@example.com",
      password: "password",
    });
  };
}
```

#### Server Components

```typescript
import { createClient } from "@/lib/supabase/server";

export default async function MyServerComponent() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  return <div>Hello {user?.email}</div>;
}
```

## Authentication Flow

### Sign In Flow

1. User enters email and password on `/login`
2. Form submits to Supabase auth
3. On success, user is redirected to `/dashboard`
4. Middleware validates session on each request

### Protected Routes

The middleware (`src/middleware.ts`) protects routes:

- `/dashboard/*` - Requires authentication
- `/login` - Redirects to dashboard if already logged in

### Sign Out Flow

1. User clicks "Sign Out" button
2. POST request to `/auth/signout`
3. Session is cleared
4. User is redirected to `/login`

### Password Recovery Flow

1. User clicks "Forgot password?" on login page
2. User enters email on `/forgot-password`
3. Supabase sends recovery email with magic link
4. User clicks link in email → redirected to `/reset-password`
5. User enters new password
6. Password updated, redirected to `/login`

## Setting Up Authentication in Supabase

### 1. Enable Email Auth

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)

### 2. Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to `http://localhost:3000` (development)
3. Add production URL when deploying

### 3. Configure Redirect URLs

Add allowed redirect URLs:

- `http://localhost:3000/**` (development)
- `http://localhost:3000/reset-password` (password recovery - development)
- `https://yourdomain.com/**` (production)
- `https://yourdomain.com/reset-password` (password recovery - production)

### 4. Configure Email Templates (Optional)

Customize password recovery emails:

1. Go to **Authentication** → **Email Templates**
2. Select **Reset Password** template
3. Customize the email content
4. Use `{{ .ConfirmationURL }}` for the reset link

**Note:** The recovery URL automatically uses the current domain, so it works in both development and production without changes.

## User Management

### Creating Test Users

#### Option 1: Via Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter email and password
4. Click **Create User**

#### Option 2: Via Sign Up Page (To be implemented)

```typescript
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "securepassword",
});
```

## Security Best Practices

### ✅ Implemented

1. **Environment Variables** - Credentials stored in env vars
2. **Server-side Validation** - User checked on server
3. **Middleware Protection** - Routes protected at middleware level
4. **Secure Cookies** - Session stored in httpOnly cookies

### 🔒 Additional Recommendations

1. **Enable RLS** (Row Level Security) in Supabase
2. **Set up email verification** for new users
3. **Implement password reset** functionality
4. **Add rate limiting** for auth endpoints
5. **Enable MFA** (Multi-Factor Authentication)

## Troubleshooting

### "Invalid API key" Error

- Check that environment variables are set correctly
- Restart development server after adding env vars
- Verify credentials in Supabase dashboard

### Redirect Loop

- Check middleware configuration
- Verify Site URL in Supabase settings
- Clear browser cookies and try again

### Session Not Persisting

- Check that cookies are enabled in browser
- Verify middleware is running (check `middleware.ts`)
- Check browser console for errors

## API Reference

### Authentication Methods

```typescript
// Sign in
await supabase.auth.signInWithPassword({ email, password });

// Sign out
await supabase.auth.signOut();

// Get current user
const {
  data: { user },
} = await supabase.auth.getUser();

// Get session
const {
  data: { session },
} = await supabase.auth.getSession();

// Reset password for email
const origin = window.location.origin;
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${origin}/reset-password`,
});

// Update password (after reset)
await supabase.auth.updateUser({
  password: newPassword,
});
```

## Next Steps

### Recommended Enhancements

1. **Sign Up Page** - Allow new user registration
2. ~~**Password Reset** - Forgot password functionality~~ ✅ **Implemented**
3. **Email Verification** - Verify email addresses
4. **Profile Management** - Edit user profile
5. **Social Auth** - Google, GitHub, etc.
6. **MFA** - Two-factor authentication

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Discord](https://discord.supabase.com)

## Support

For issues or questions:

1. Check [Supabase Documentation](https://supabase.com/docs)
2. Visit [Supabase Discord](https://discord.supabase.com)
3. Check project issues on GitHub
