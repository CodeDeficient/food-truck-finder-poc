# Supabase Setup Guide

This guide provides a comprehensive walkthrough for setting up and configuring your Supabase environment for this project. Following these steps will ensure that your local development and production environments are stable, secure, and aligned with the project's architecture.

## 1. Environment Variables

Create a `.env.local` file in the root of the project and add the following environment variables. You can get these values from your Supabase project dashboard.

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://<projectid>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
DATABASE_PASSWORD=""

# API Keys
FIRECRAWL_API_KEY=""
GEMINI_API_KEY=""
TAVILY_API_KEY=""
GOOGLE_GEMINI_API_KEY=""

# Cron job authentication secret
CRON_SECRET=""
```

## 2. Local Supabase Setup

To set up Supabase for local development, you need to have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed.

### 2.1. Start Supabase Services

Run the following command to start the local Supabase stack:

```bash
npx supabase start
```

### 2.2. Apply Migrations

Once the local Supabase stack is running, apply the database migrations to set up the schema:

```bash
npx supabase db reset
```

This will also run the `seed.sql` file if you have one.

## 3. RLS Policies

The project uses Row Level Security (RLS) to control access to data. Here are the key RLS policies implemented:

### `profiles` table

- **Users can view their own profile:** Allows users to select their own profile data.
- **Users can update their own profile:** Allows users to update their own profile data.

### `food_trucks` table

- **Food trucks are publicly readable:** Allows public read access to all food trucks.

### `user_favorites` table

- **Users can view their own favorites:** Allows authenticated users to view their own favorited trucks.
- **Users can create their own favorites:** Allows authenticated users to insert their own favorited trucks.
- **Users can delete their own favorites:** Allows authenticated users to delete their own favorited trucks.

For more details, you can review the migration files in the `supabase/migrations` directory.

## 4. Authentication Readiness Checklist

This checklist is mirrored from the `AUTH_READINESS_REPORT.md` and should be used to ensure that the authentication system is ready for production deployment.

### Core Authentication ✅

- [x] Email/Password login via Supabase Auth
- [x] OAuth authentication (Google)
- [x] Session management
- [x] Secure auth callbacks with rate limiting
- [x] Role-based authentication (admin, customer, food_truck_owner)

### Route Protection ✅

- [x] Middleware-based route protection
- [x] Admin route guards (`/admin/*`)
- [x] User route guards (`/profile`, `/favorites`)
- [x] Automatic redirects for unauthorized access
- [x] Access denied page implementation

### Security Features ✅

- [x] Rate limiting for authentication attempts
- [x] Audit logging for security events
- [x] IP-based request tracking
- [x] User agent logging
- [x] Session validation
- [x] CSRF protection via Supabase Auth

