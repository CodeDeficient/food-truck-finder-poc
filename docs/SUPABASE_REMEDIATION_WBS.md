# Supabase Database Remediation - Work Breakdown Structure (WBS)

**Project Objective:** Systematically resolve all 54 Supabase advisor issues to optimize database performance, enhance security, and establish production-ready database architecture.

**Status:** READY FOR IMPLEMENTATION  
**Priority:** HIGH - Database optimization impacts performance and security  
**Timeline Estimate:** 2-3 days

---

## WBS Standards Compliance

This document adheres to the established WBS standards:
- ✅ **Numbered, Hierarchical Structure** 
- ✅ **Checkbox Tracking** with `[ ]` for pending and `[x]` for completed
- ✅ **CCR Ratings** (Complexity, Clarity, Risk on 0-10 scale)
- ✅ **Fractal Task Breakdown** to manageable components
- ✅ **Detailed Guidance** with actionable steps
- ✅ **Verification Steps** for completion validation

---

## Issue Summary Analysis

**Total Issues:** 54
- **SECURITY:** 2 issues (AUTH configuration)
- **PERFORMANCE:** 52 issues (RLS policies + indexes)
  - **Multiple Permissive Policies:** 48 issues across 6 tables
  - **Unindexed Foreign Keys:** 3 issues
  - **Unused Indexes:** 15 issues

---

## Section 1: Security Hardening (Critical Priority)

### **[ ] 1.1: Configure Auth OTP Expiry**
- **Issue:** `auth_otp_long_expiry` - OTP expiry exceeds recommended threshold
- **Impact:** Security vulnerability - extended exposure window for OTP attacks
- **Location:** Supabase Dashboard → Authentication → Settings
- **CCR:** Complexity: 1, Clarity: 10, Risk: 7
- **Guidance:** 
  1. Navigate to Supabase Dashboard
  2. Go to Authentication → Settings → Email Templates
  3. Set OTP expiry to 3600 seconds (1 hour) or less
  4. Recommended: 1800 seconds (30 minutes) for enhanced security
- **Verification:** 
  ```bash
  # Test OTP expiry timing
  # Send test OTP and verify it expires within configured timeframe
  ```
- **Documentation:** https://supabase.com/docs/guides/platform/going-into-prod#security

### **[ ] 1.2: Enable Leaked Password Protection**
- **Issue:** `auth_leaked_password_protection` - Feature currently disabled
- **Impact:** Users can set compromised passwords, increasing security risk
- **Location:** Supabase Dashboard → Authentication → Settings
- **CCR:** Complexity: 1, Clarity: 10, Risk: 8
- **Guidance:**
  1. Navigate to Authentication → Settings
  2. Find "Password Security" section
  3. Enable "Prevent sign ups with leaked passwords"
  4. Enable "Require password confirmation" if not already active
- **Verification:**
  ```bash
  # Test with known compromised password (e.g., "password123")
  # Should be rejected with appropriate error message
  ```
- **Documentation:** https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

---

## Section 2: Row-Level Security (RLS) Policy Optimization

**Problem:** Multiple permissive policies per table/role/action causing performance degradation

### **[ ] 2.1: Consolidate Events Table RLS Policies**
- **Affected Roles:** `anon`, `authenticated`, `authenticator`, `dashboard_user`
- **Affected Actions:** `SELECT`, `INSERT`, `UPDATE`, `DELETE` (12 policy conflicts)
- **CCR:** Complexity: 6, Clarity: 8, Risk: 4

#### **[ ] 2.1.1: Analyze Current Events Policies**
- **Guidance:**
  ```sql
  -- Review current policies
  SELECT schemaname, tablename, policyname, permissive, roles, cmd 
  FROM pg_policies 
  WHERE tablename = 'events' AND schemaname = 'public';
  ```
- **Expected Policies:**
  - "Allow admins to manage all events"
  - "Allow owners to manage their events"
  - "Allow public read access to events"
  - "Allow authenticated users to create events"

#### **[ ] 2.1.2: Design Consolidated Policy Structure**
- **Guidance:** Create single policy per role/action combination:
  ```sql
  -- Example consolidated SELECT policy for anon
  CREATE POLICY "consolidated_events_select_anon" ON public.events
  FOR SELECT TO anon
  USING (
    -- Admin access (if admin role detected)
    auth.jwt() ->> 'role' = 'admin' 
    OR 
    -- Owner access
    auth.uid() = user_id 
    OR 
    -- Public read access
    true
  );
  ```

#### **[ ] 2.1.3: Drop Existing Policies**
- **Risk:** HIGH - Test in staging first
- **Guidance:**
  ```sql
  -- Drop existing policies (DO IN STAGING FIRST)
  DROP POLICY IF EXISTS "Allow admins to manage all events" ON public.events;
  DROP POLICY IF EXISTS "Allow owners to manage their events" ON public.events;
  DROP POLICY IF EXISTS "Allow public read access to events" ON public.events;
  DROP POLICY IF EXISTS "Allow authenticated users to create events" ON public.events;
  ```

#### **[ ] 2.1.4: Create Consolidated Policies**
- **Verification:** Test each role/action combination still works correctly

### **[ ] 2.2: Consolidate Food Truck Schedules Policies**
- **Affected Roles:** `anon`, `authenticated`, `authenticator`, `dashboard_user`
- **Policy Count:** 12 conflicts
- **CCR:** Complexity: 6, Clarity: 8, Risk: 4
- **Process:** Follow same pattern as 2.1 for `food_truck_schedules` table

### **[ ] 2.3: Consolidate Menu Items Policies**
- **Affected Roles:** `anon`, `authenticated`, `authenticator`, `dashboard_user`  
- **Policy Count:** 12 conflicts
- **CCR:** Complexity: 6, Clarity: 8, Risk: 4
- **Process:** Follow same pattern as 2.1 for `menu_items` table

### **[ ] 2.4: Consolidate Scraper Configs Policies**
- **Affected Roles:** `anon`, `authenticated`, `authenticator`, `dashboard_user`
- **Policy Count:** 4 conflicts (SELECT only)
- **CCR:** Complexity: 4, Clarity: 9, Risk: 3
- **Guidance:** Simpler consolidation - only SELECT policies to merge

---

## Section 3: Database Index Optimization

### **[ ] 3.1: Add Missing Foreign Key Indexes**
- **Performance Impact:** HIGH - Unindexed FKs cause slow JOIN operations
- **CCR:** Complexity: 3, Clarity: 10, Risk: 2

#### **[ ] 3.1.1: Index data_processing_queue.truck_id**
- **Query:**
  ```sql
  CREATE INDEX IF NOT EXISTS idx_data_processing_queue_truck_id 
  ON public.data_processing_queue (truck_id);
  ```
- **Verification:** 
  ```sql
  EXPLAIN ANALYZE SELECT * FROM data_processing_queue WHERE truck_id = 'sample-uuid';
  ```

#### **[ ] 3.1.2: Index events.food_truck_id**  
- **Query:**
  ```sql
  CREATE INDEX IF NOT EXISTS idx_events_food_truck_id 
  ON public.events (food_truck_id);
  ```

#### **[ ] 3.1.3: Index food_truck_schedules.food_truck_id**
- **Query:**
  ```sql
  CREATE INDEX IF NOT EXISTS idx_food_truck_schedules_food_truck_id 
  ON public.food_truck_schedules (food_truck_id);
  ```

### **[ ] 3.2: Audit and Remove Unused Indexes**
- **Storage Impact:** MEDIUM - 15 unused indexes consuming storage
- **CCR:** Complexity: 2, Clarity: 7, Risk: 5

#### **[ ] 3.2.1: Validate Index Usage Statistics**
- **Guidance:**
  ```sql
  -- Check index usage statistics
  SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
  FROM pg_stat_user_indexes 
  WHERE idx_scan = 0
  ORDER BY schemaname, tablename, indexname;
  ```

#### **[ ] 3.2.2: Create Index Removal Plan**
- **Affected Indexes:**
  - `idx_api_usage_service_date`
  - `idx_discovered_directories_*` (5 indexes)
  - `idx_discovered_urls_*` (7 indexes)
  - `idx_food_trucks_location`
  - `idx_food_trucks_state` 
  - `idx_food_trucks_user_id`
  - `idx_scraping_jobs_scheduled_at`

#### **[ ] 3.2.3: Safe Index Removal Process**
- **Risk Mitigation:** Rename before dropping to enable quick rollback
- **Guidance:**
  ```sql
  -- Step 1: Rename index (allows rollback)
  ALTER INDEX idx_api_usage_service_date RENAME TO idx_api_usage_service_date_deprecated;
  
  -- Step 2: Monitor for 24-48 hours
  -- Step 3: If no issues, drop the renamed index
  DROP INDEX IF EXISTS idx_api_usage_service_date_deprecated;
  ```

---

## Section 4: Verification and Testing

### **[ ] 4.1: Performance Baseline Measurement**
- **CCR:** Complexity: 4, Clarity: 8, Risk: 1
- **Guidance:**
  ```sql
  -- Capture baseline metrics
  SELECT 
    schemaname,
    tablename,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_tup_hot_upd,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch
  FROM pg_stat_user_tables 
  WHERE schemaname = 'public';
  ```

### **[ ] 4.2: Policy Performance Testing**
- **Test Scenarios:**
  1. Anonymous user SELECT queries
  2. Authenticated user CRUD operations  
  3. Admin role operations
  4. Dashboard user access patterns

### **[ ] 4.3: Application Integration Testing**
- **Areas to Test:**
  - Food truck listing pages
  - Admin dashboard functionality
  - Menu item management
  - Schedule management
  - User authentication flows

---

## Implementation Timeline

### **Day 1: Security & Planning (4-6 hours)**
- [ ] Complete Section 1: Security Hardening
- [ ] Analyze current RLS policies (2.1.1, 2.2.1, 2.3.1)
- [ ] Design consolidated policy structures
- [ ] Create staging environment backup

### **Day 2: RLS Policy Consolidation (6-8 hours)**
- [ ] Implement consolidated policies for all tables
- [ ] Test policy changes in staging
- [ ] Deploy to production with rollback plan

### **Day 3: Index Optimization & Validation (4-6 hours)**
- [ ] Add missing foreign key indexes
- [ ] Implement safe unused index removal
- [ ] Performance testing and validation
- [ ] Documentation updates

---

## Risk Management

### **High-Risk Activities**
1. **RLS Policy Changes** - Could break authentication/authorization
2. **Index Removal** - Could degrade query performance  
3. **Production Database Changes** - Could impact live users

### **Mitigation Strategies**
1. **Staging Environment Testing** - Test all changes before production
2. **Phased Rollout** - Implement changes in batches
3. **Rollback Plans** - Documented rollback procedures for each change
4. **Monitoring** - Real-time performance monitoring during changes

### **Emergency Contacts**
- **Database Issues:** Use Supabase Dashboard alerts
- **Performance Degradation:** Monitor via application metrics
- **Authentication Problems:** Test with non-admin accounts

---

## Success Criteria

### **Completion Metrics**
- [ ] Zero SECURITY level advisor issues
- [ ] Zero PERFORMANCE level advisor issues  
- [ ] All RLS policies consolidated (1 per role/action)
- [ ] All foreign keys properly indexed
- [ ] Unused indexes safely removed

### **Performance Targets**
- [ ] Query response time improvement >20%
- [ ] Reduced policy evaluation overhead
- [ ] Optimized storage utilization
- [ ] Maintained application functionality

---

## Documentation References

- [Supabase Database Linter](https://supabase.com/docs/guides/database/database-linter)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Performance](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys)
- [Production Readiness](https://supabase.com/docs/guides/platform/going-into-prod)

---

**Next Steps After Completion:**
1. Schedule monthly database health reviews
2. Implement automated performance monitoring
3. Plan Uprooted Vegan Cuisine onboarding integration
4. Document lessons learned for future database changes
