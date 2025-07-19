# Supabase Improvement Plan (WBS)

## 1. Security Enhancements

- **Task 1.1: Reduce OTP Expiry**
  - **Details**: Set OTP expiry to less than one hour.
  - **Guidance**: Adjust the configuration as per [Supabase Security Guidelines](https://supabase.com/docs/guides/platform/going-into-prod#security).
  - **Verification**: Ensure OTPs expire within the new threshold.

- **Task 1.2: Enable Leaked Password Protection**
  - **Details**: Activate HaveIBeenPwned checks.
  - **Guidance**: Refer to [Password Security Guidelines](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
  - **Verification**: Validate feature activation in Auth settings.

## 2. Performance Improvements

- **Task 2.1: Consolidate Row Level Security (RLS) Policies**
  - **Details**: Merge multiple permissive RLS policies per table action.
  - **Guidance**: Simplify policies for each role/action as per [RLS Guidelines](https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies).
  - **Verification**: Check policy execution efficiency.

- **Task 2.2: Add Indexes for Unindexed Foreign Keys**
  - **Details**: Address unindexed foreign key constraints to improve query performance.
  - **Guidance**: Identify and index foreign keys using Supabase insights.
  - **Verification**: Confirm performance improvement post-indexing.

## 3. Index Optimization

- **Task 3.1: Evaluate Unused Indexes**
  - **Details**: Assess and remove indexes that have not been used.
  - **Guidance**: Use Supabase metrics to identify and validate unnecessary indexes.
  - **Verification**: Ensure no significant performance drop after removal.

## 4. Comprehensive Review and Testing

- **Task 4.1: Conduct System Performance Tests**
  - **Details**: Execute tests to detect and resolve any outstanding performance issues.
  - **Guidance**: Utilize PgAudit and logging tools for thorough review.
  - **Verification**: Validate results with system benchmarks.
