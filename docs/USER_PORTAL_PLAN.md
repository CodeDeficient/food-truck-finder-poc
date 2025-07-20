# User Portal Plan

This document outlines the design and implementation plan for the user-facing portal features of the Food Truck Finder application.

## Phase 1: MVP Features (Current Implementation)

### 1.1 User Favorites System
- **Objective**: Allow users to save and manage their favorite food trucks
- **Components**: 
  - Favorite button integration in TruckCard
  - User favorites list view
  - Favorite/unfavorite toggle functionality
- **Database**: `user_favorites` table with RLS policies
- **User Flow**:
  1. User clicks heart/star icon on truck card
  2. Truck is added to favorites (requires authentication)
  3. User can view favorites in dedicated portal section
  4. User can remove favorites from list

### 1.2 Portal Navigation
- **Access Method**: Sliding panel or dedicated route
- **Components**:
  - User profile section (basic info)
  - Favorites list
  - Settings page
- **Design**: Consistent with glassmorphism theme

## Phase 2: Enhanced Features (Future)

### 2.1 User Notifications
- **Objective**: Notify users about favorite truck locations and specials
- **Features**:
  - Location-based notifications when favorite trucks are nearby
  - Special offers and menu updates from favorite trucks
  - Email digest of weekly favorite truck activities

### 2.2 User Reviews & Ratings
- **Objective**: Allow users to rate and review food trucks
- **Database**: `user_reviews` table
- **Features**:
  - 5-star rating system
  - Written reviews with character limits
  - Photo uploads for reviews
  - Helpful/not helpful voting on reviews

### 2.3 Personalized Recommendations
- **Objective**: AI-powered recommendations based on user preferences
- **Features**:
  - Cuisine type preferences
  - Price range preferences
  - Location-based suggestions
  - "Trucks like your favorites" suggestions

## Phase 3: Advanced Features (Long-term)

### 3.1 Social Features
- **Objective**: Community engagement around food trucks
- **Features**:
  - User profiles with favorite trucks
  - Follow other users
  - Share favorite trucks with friends
  - Check-in system at food truck visits

### 3.2 Loyalty & Rewards
- **Objective**: Integrate with truck owner reward systems
- **Features**:
  - Digital loyalty cards
  - Punch card systems
  - Special user-only deals
  - Gamification elements

### 3.3 Event & Schedule Tracking
- **Objective**: Help users track truck schedules and events
- **Features**:
  - Calendar integration
  - Reminder system for favorite truck schedules
  - Event notifications (festivals, special locations)
  - "Plan my food truck route" feature

## Technical Implementation

### Authentication Requirements
- **Provider**: To be determined (Firebase Auth, Supabase Auth, or other)
- **Social Login**: Google, Facebook integration
- **Guest Access**: Limited functionality without account

### Database Schema Updates Required
```sql
-- Phase 1
user_favorites (✓ Created)

-- Phase 2  
user_reviews (id, user_id, truck_id, rating, review_text, photos, created_at)
user_preferences (id, user_id, cuisine_preferences, price_preferences, location_preferences)

-- Phase 3
user_follows (id, follower_id, following_id, created_at)
user_checkins (id, user_id, truck_id, location, created_at)
loyalty_cards (id, user_id, truck_id, visits_count, points, created_at)
```

### API Endpoints Required
```
GET /api/user/favorites - Get user's favorite trucks
POST /api/user/favorites - Add truck to favorites  
DELETE /api/user/favorites/:truckId - Remove from favorites

GET /api/user/profile - Get user profile
PUT /api/user/profile - Update user profile
GET /api/user/recommendations - Get personalized recommendations
```

### UI/UX Considerations
- **Mobile-First**: Portal must work seamlessly on mobile devices
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Performance**: Lazy loading for favorites list, optimistic updates
- **Offline**: Basic functionality should work offline with service workers

## Success Metrics
- **Engagement**: % of users who create accounts and use favorites
- **Retention**: User return rate and session frequency
- **Conversion**: Users who transition from favorites to actual truck visits
- **Satisfaction**: User feedback and ratings of portal features

## Implementation Priority
1. ✅ Database migration for user_favorites
2. 🔄 Favorite button UI component
3. 🔄 User portal basic layout
4. ⏳ Favorites list display
5. ⏳ User authentication integration
6. ⏳ Settings page
7. ⏳ Mobile responsiveness optimization

## Risk Mitigation
- **Authentication Complexity**: Start with simple email/password, add social later
- **Performance**: Implement pagination and caching for large favorites lists
- **Privacy**: Ensure GDPR compliance for user data storage
- **Spam**: Rate limiting and validation for user-generated content
