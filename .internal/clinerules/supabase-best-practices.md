# Supabase Best Practices & Operational Learnings

## Brief overview
This rule set documents key operational learnings and best practices derived from recent interactions with Supabase, focusing on improving the reliability and efficiency of database migrations and administration.

## Development Workflow

- **Rule 1.1: Prioritize Manual SQL Execution:** When Supabase CLI (`db push`, `db pull`) or MCP tools consistently fail due to environmental issues (e.g., Docker dependency, authentication errors), the primary fallback is to generate a manual SQL script. This script should be executed directly in the Supabase dashboard's SQL Editor to ensure reliable schema changes.

  - _Trigger Case_: Repeated failures of Supabase CLI or MCP tools.
  - _Example_: Instead of retrying a failing `npx supabase db push` command, consolidate the necessary SQL into a single file (e.g., `MANUAL_MIGRATION.sql`) and execute it in the dashboard.

- **Rule 1.2: Verify All Schema Changes with SQL Queries:** After applying any schema changes (manually or via tooling), always run `SELECT` queries against the appropriate `pg_` catalog tables (`pg_indexes`, `pg_policies`, etc.) to verify that the changes have been applied correctly. Do not assume success.

  - _Trigger Case_: After any `CREATE`, `ALTER`, or `DROP` statement is executed.
  - _Example_: After creating a new index, run `SELECT indexname FROM pg_indexes WHERE indexname = 'my_new_index';` to confirm its existence.

- **Rule 1.3: Incremental and Idempotent Migrations:** All migration scripts, whether manual or file-based, should be written to be idempotent (i.e., safe to run multiple times). Use `IF NOT EXISTS` for table/index/extension creation and `IF EXISTS` for dropping objects. This prevents errors when re-running scripts.

  - _Trigger Case_: When writing any DDL (Data Definition Language) script.
  - _Example_: Use `CREATE TABLE IF NOT EXISTS ...` instead of `CREATE TABLE ...`.

- **Rule 1.4: Resolve Migration History Mismatches Methodically:** If the Supabase CLI reports a migration history mismatch, follow this specific sequence:
  1.  Delete all local migration files in `supabase/migrations`.
  2.  Run `npx supabase migration repair` with the `--status reverted` flag for all migrations listed in the error message.
  3.  Run `npx supabase db pull` to generate a clean, consolidated schema file.
  4.  Re-create any new, pending migrations with fresh timestamps.

  - _Trigger Case_: When `npx supabase db push` or `npx supabase db pull` fails with a history mismatch error.

- **Rule 1.5: Mandatory RLS for User-Specific Data:** For any new table that contains a foreign key to `auth.users` or any user-identifying column (e.g., `user_id`), Row Level Security (RLS) must be enabled immediately after table creation. A policy must be implemented to ensure users can only access their own data, typically by checking `auth.uid() = user_id`.

  - _Trigger Case_: Creation of any table containing user-specific, non-public data.
  - _Example_:
    ```sql
    -- After creating a 'profiles' table with a 'user_id' column
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING ( auth.uid() = user_id );
