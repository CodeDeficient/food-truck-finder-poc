# Food Truck Finder - Launch Readiness Development Plan

**Date**: August 6, 2025  
**Status**: Authentication & Admin Setup Priority  
**Goal**: Private Beta Launch in 2 weeks

---

## 🚨 **CRITICAL PATH: Authentication Setup**

### **Priority 1: Google OAuth Configuration (1-2 days)**

**Current State**: 
- ✅ Authentication UI complete (`AuthModal`, `LoginPage`)
- ✅ OAuth handlers implemented (`useAuthHandlers`, `AuthOAuthForm`)
- ✅ Callback route configured (`/auth/callback/route.ts`)
- ❌ **Supabase OAuth not configured**

**Required Actions**:
1. **Configure Google OAuth in Supabase Dashboard**
   - Add Google as OAuth provider
   - Set redirect URLs: `https://your-app.vercel.app/auth/callback`
   - Get Google Client ID and Secret from Google Cloud Console
   
2. **Test Authentication Flow**
   - Test Google sign-in → callback → role-based redirect
   - Verify admin role assignment in `profiles` table
   - Test middleware protection on `/admin` routes

3. **Create Admin Profile**
   - Sign in with your Google account
   - Manually set role to 'admin' in Supabase `profiles` table
   - Verify admin dashboard access

---

## 🗺️ **CRITICAL: Map & Location Issues** 

### **Priority 2: Fix Map Performance & Pins (1-2 days)**

**Current Issues Identified**:
- Map loads slowly with loading spinner
- Pin positioning may be incorrect
- Some trucks missing coordinates

**Required Actions**:
1. **Clean Up Food Truck Location Data**
   ```sql
   -- Find trucks with missing/invalid coordinates
   SELECT name, current_location FROM food_trucks 
   WHERE current_location IS NULL 
   OR current_location->>'lat' IS NULL 
   OR current_location->>'lng' IS NULL;
   ```

2. **Optimize Map Component**
   - Remove unnecessary geocoding delays (already addressed in current code)
   - Verify all trucks have fallback coordinates
   - Test map performance with 85+ trucks

3. **Fix Pin Icons**
   - Ensure `/food-truck-icon.svg` exists in `public/` directory
   - Test pin click handlers and popups
   - Verify open/closed status visual indicators

---

## 👥 **USER EXPERIENCE: Dashboards & Features**

### **Priority 3: Basic User Dashboards (2-3 days)**

**Current State**:
- ✅ User dashboard routes exist (`/user-dashboard`, `/owner-dashboard`, `/profile`)
- ❌ **Minimal content - looks empty**

**Required Actions**:

#### **Admin Dashboard** (You - Highest Priority)
- ✅ Already functional with comprehensive features
- Test all admin functions after auth setup

#### **Food Truck Owner Dashboard** (First Customer)
- Basic truck management interface
- Menu editing capabilities  
- Location update functionality
- Simple analytics (views, clicks)

#### **Customer/User Dashboard** (Beta Users)
- Favorites functionality
- Search history
- Basic profile management
- Feedback submission form

---

## 🔧 **TECHNICAL CLEANUP: Recent Branch Work**

### **Priority 4: Merge Valuable Branch Work (1-2 days)**

**Identified Recent Work** (August 3-5):
- Modal component improvements
- Map enhancements 
- Data quality fixes
- UI component updates

**Action Plan**:
1. **Audit Recent Branches**
   ```bash
   git log --oneline --since="2025-08-03" --all
   git diff main auth-merge-review
   git diff main data-specialist-2-work
   ```

2. **Identify & Merge Valuable Changes**
   - Modal component unification
   - Map performance improvements
   - Data cleanup scripts
   - UI polish (pins, loading states)

3. **Test Integration**
   - Ensure no conflicts with current auth setup
   - Verify map improvements work with auth
   - Test modal components in authenticated flow

---

## 📋 **DETAILED TASK BREAKDOWN**

### **Week 1: Authentication & Core Fixes**

#### **Day 1-2: OAuth Setup**
- [ ] Configure Google OAuth in Supabase dashboard
- [ ] Set up Google Cloud Console OAuth app
- [ ] Test authentication flow end-to-end
- [ ] Create admin profile for yourself
- [ ] Verify middleware protection works

#### **Day 3-4: Map & Data Fixes**
- [ ] Clean up food truck location data in Supabase
- [ ] Add missing food truck icon SVG
- [ ] Test map performance with all 85 trucks
- [ ] Fix any pin positioning issues
- [ ] Optimize loading states

#### **Day 5-7: Dashboard Content**
- [ ] Create basic owner dashboard features
- [ ] Add customer favorites functionality
- [ ] Implement feedback submission
- [ ] Test user flows for all roles

### **Week 2: Polish & Beta Launch**

#### **Day 8-10: Integration & Testing**
- [ ] Merge valuable work from recent branches
- [ ] Test all user authentication flows
- [ ] Verify admin, owner, and customer dashboards
- [ ] Performance testing with multiple users

#### **Day 11-14: Beta Launch Preparation**
- [ ] Final testing on production environment
- [ ] Document beta user onboarding process
- [ ] Prepare first customer onboarding
- [ ] Launch private beta with 10-20 users

---

## 🛠️ **IMMEDIATE NEXT ACTIONS (Today/Tomorrow)**

### **Step 1: Supabase OAuth Configuration**
1. **Go to Supabase Dashboard** → Authentication → Settings
2. **Enable Google Provider**
3. **Get Google OAuth credentials**:
   - Go to Google Cloud Console
   - Create/use existing project
   - Enable Google+ API
   - Create OAuth 2.0 client ID
   - Add authorized redirect URI: `https://your-project.vercel.app/auth/callback`

### **Step 2: Test Authentication** 
```bash
# Test the login flow
npm run dev
# Navigate to /login
# Try Google sign-in
# Check Supabase auth users table
# Manually set your role to 'admin' in profiles table
```

### **Step 3: Map Data Cleanup**
```sql
-- Run in Supabase SQL Editor
UPDATE food_trucks 
SET current_location = jsonb_build_object(
  'lat', 32.7767, 
  'lng', -79.9311, 
  'address', 'Charleston, SC'
)
WHERE current_location IS NULL 
OR current_location->>'lat' IS NULL;
```

---

## 🚧 **POTENTIAL BLOCKERS & SOLUTIONS**

### **Authentication Issues**
- **Problem**: Google OAuth redirect fails
- **Solution**: Verify redirect URIs match exactly between Google Console and Supabase

### **Map Performance**
- **Problem**: Map loads slowly with 85+ markers
- **Solution**: Implement marker clustering or viewport-based loading

### **Missing Branch Work**
- **Problem**: Valuable UI improvements scattered across branches
- **Solution**: Use selective cherry-picking instead of full merges

---

## 🎯 **SUCCESS CRITERIA**

### **Authentication Working**
- [ ] You can sign in as admin via Google OAuth
- [ ] Admin dashboard is accessible and secured
- [ ] Customer/owner accounts can be created
- [ ] Role-based redirects function properly

### **Core Platform Functional**
- [ ] Map displays all 85 food trucks with correct pins
- [ ] Search and filtering work properly
- [ ] Admin functions operational
- [ ] Basic dashboards have meaningful content

### **Beta Launch Ready**
- [ ] First customer can be onboarded successfully
- [ ] 10-20 beta users can sign up and use core features
- [ ] No critical bugs in main user flows
- [ ] Feedback collection system operational

---

**This plan prioritizes the critical path items that will unblock your launch while ensuring you don't lose valuable work from recent development.**

Ready to start with the Supabase OAuth configuration? That's the key blocker for everything else!
