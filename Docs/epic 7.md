# EPIC 7: Sub-Trainer Management (Sprint 7 - Weeks 17-19)

## Epic Overview

Implement the sub-trainer management system for Pro and Enterprise tier trainers. This allows primary trainers to add team members, manage their permissions, assign separate calendars, and track their activity. Sub-trainers have limited access focused on their own schedule and assigned clients, while primary trainers maintain full administrative control.

---

### Iteration 7.1: Sub-Trainer Invitation System

**Duration**: 3 days

**User Stories**:

- As a primary trainer, I want to invite sub-trainers via email so that they can join my team
- As a sub-trainer, I want to receive an invitation so that I can create my account
- As a primary trainer, I want to see pending invitations so that I can track who hasn't joined yet

**Technical Tasks**:

1. Create sub-trainers management page: `app/(dashboard)/sub-trainers/page.tsx`
   - Feature gate: Check Pro/Enterprise tier
   - List of current sub-trainers with status (Active, Invited, Inactive)
   - "Invite Sub-Trainer" button
   - Seat usage display: "2 of 2 seats used" with upgrade option
   - Table columns: Name, Email, Status, Bookings (count), Last Active, Actions

2. Build invitation modal: `components/sub-trainers/invite-modal.tsx`
   - Form fields: Email, Name, Welcome message (optional)
   - Validation: Email format, not already invited
   - Send button with loading state
   - Success confirmation

3. Create invitation API: `app/api/sub-trainers/invite/route.ts`
   - POST endpoint accepting email and name
   - Check tier limits (Pro: 2 seats, Enterprise: unlimited)
   - Generate unique invitation token (JWT with 7-day expiration)
   - Create pending User record with role SUB_TRAINER
   - Link to primary trainer via trainerId
   - Send invitation email via Resend
   - Return success/error

4. Design invitation email template: `emails/sub-trainer-invitation.tsx`
   - Personalized greeting from primary trainer
   - Explanation of role and access
   - "Accept Invitation" button with token link
   - Link format: `https://trainerdesk.com/accept-invitation?token=xxx`
   - Expiration notice (7 days)
   - TrainerDesk branding

5. Create invitation acceptance page: `app/accept-invitation/page.tsx`
   - Public route (no auth required)
   - Verify token validity and expiration
   - Show primary trainer's business name
   - Registration form: Password, Confirm password
   - Terms acceptance checkbox
   - "Join Team" button

6. Build acceptance API: `app/api/sub-trainers/accept/route.ts`
   - POST: Validate token, verify not expired
   - Hash password and update User record
   - Set status to Active
   - Create session (auto-login)
   - Redirect to dashboard with welcome banner
   - Send confirmation email to primary trainer

7. Implement pending invitations list:
   - Show invitations awaiting acceptance
   - Resend invitation button (generates new token)
   - Cancel invitation button (deletes pending record)
   - Expiration countdown display

8. Add seat management:
   - Calculate used seats vs tier limit
   - Prevent invitations if limit reached
   - Show upgrade prompt for additional seats
   - Per-seat pricing: $5/month per additional seat (Pro only)

**Acceptance Criteria**:

- Primary trainers can send invitations successfully
- Invitation emails delivered with valid links
- Sub-trainers can accept invitations and create accounts
- Token expiration enforced (7 days)
- Seat limits respected based on subscription tier
- Pending invitations tracked and manageable
- Resend and cancel functions work correctly
- Primary trainer notified when invitation accepted

---

### Iteration 7.2: Permission System & Role Management

**Duration**: 3 days

**User Stories**:

- As a sub-trainer, I want to access only my schedule so that I focus on my clients
- As a primary trainer, I want sub-trainers restricted from billing settings so that account security is maintained
- As a sub-trainer, I want to manage my bookings so that I can serve clients effectively

**Technical Tasks**:

1. Define permission matrix in `lib/constants/permissions.ts`:

   ```typescript
   export const PERMISSIONS = {
     PRIMARY_TRAINER: {
       viewAllBookings: true,
       viewOwnBookings: true,
       manageBookings: true,
       viewAllClients: true,
       manageSubTrainers: true,
       manageBilling: true,
       manageSettings: true,
       editPage: true,
       viewAnalytics: true,
     },
     SUB_TRAINER: {
       viewAllBookings: false,
       viewOwnBookings: true,
       manageBookings: true, // own bookings only
       viewAllClients: false, // only assigned clients
       manageSubTrainers: false,
       manageBilling: false,
       manageSettings: false, // only own profile
       editPage: false,
       viewAnalytics: false, // only own stats
     },
   };
   ```

2. Create permission check hook: `lib/hooks/use-permissions.ts`

   ```typescript
   export function usePermissions() {
     const { data: user } = useUser();

     const can = (permission: string) => {
       return PERMISSIONS[user.role][permission] === true;
     };

     return { can, role: user.role };
   }
   ```

3. Implement route protection middleware:
   - Check user role in `middleware.ts`
   - Restrict sub-trainer access to certain routes
   - Redirect unauthorized access to dashboard
   - Protected routes: /settings/billing, /sub-trainers, /page-builder

4. Update navigation for sub-trainers:
   - Hide restricted menu items
   - Show only: Dashboard, Calendar, My Bookings, My Clients, Profile
   - Display "Sub-Trainer" badge in header
   - Limited settings access (profile only)

5. Modify API endpoints for role-based filtering:
   - `GET /api/bookings`: Filter by trainerId for sub-trainers
   - `GET /api/clients`: Return only assigned clients
   - `GET /api/analytics`: Return only sub-trainer's stats
   - Reject unauthorized requests with 403 Forbidden

6. Create permission gate component: `components/shared/permission-gate.tsx`
   - Similar to feature gate but checks permissions
   - Wraps UI elements requiring specific permissions
   - Shows "Access Denied" message if unauthorized

7. Add role display in UI:
   - User profile shows role badge
   - Sub-trainer dashboard has informational banner
   - Banner: "You're managing bookings for [Business Name]"
   - Link to contact primary trainer

**Acceptance Criteria**:

- Sub-trainers can only access permitted routes
- Navigation menu reflects available permissions
- API endpoints enforce role-based filtering
- Sub-trainers see only their own bookings and clients
- Unauthorized access attempts blocked gracefully
- Permission checks work consistently across app
- Clear indication of sub-trainer role in UI

---

### Iteration 7.3: Separate Calendar Management

**Duration**: 4 days

**User Stories**:

- As a sub-trainer, I want to set my own availability so that clients can book with me
- As a primary trainer, I want to view all team calendars so that I can coordinate schedules
- As a client, I want to select which trainer to book with so that I get my preferred coach

**Technical Tasks**:

1. Extend availability system from EPIC 3:
   - Availability blocks already have `trainerId` field
   - Sub-trainers create blocks linked to their ID
   - Query filters availability by specific trainer

2. Update calendar page for sub-trainers:
   - `app/(dashboard)/calendar/page.tsx` checks role
   - Sub-trainers see only their availability grid
   - Primary trainers see trainer selector dropdown
   - Option to view: My Calendar, All Trainers, [Specific Sub-Trainer]

3. Create team calendar view: `components/calendar/team-calendar-view.tsx`
   - Side-by-side calendar comparison
   - Shows primary + all sub-trainers
   - Color-coded by trainer
   - Identifies scheduling conflicts
   - Useful for primary trainer coordination

4. Update booking calendar widget:
   - Add trainer selection if multiple trainers exist
   - Client chooses trainer before selecting slot
   - Display trainer name and photo
   - Filter available slots by selected trainer
   - Default to primary trainer if not specified

5. Modify slot generation API:
   - `GET /api/bookings/availability` accepts `trainerId` parameter
   - If not provided and multiple trainers, aggregate all availability
   - Return slots with trainer information
   - Ensure no double-booking across trainers

6. Update booking creation to associate with trainer:
   - Booking model already has `trainerId` field
   - Client's selected trainer stored in booking
   - Confirmation email mentions specific trainer
   - Sub-trainer receives notification for their bookings

7. Add calendar synchronization:
   - Optional: Integration with Google Calendar (future enhancement)
   - Export availability to .ics file
   - Import external calendar events to block time

8. Create availability conflicts alert:
   - Detect when primary and sub-trainer have overlapping blocks
   - Not an error (they can have same time slots)
   - Alert if same trainer has overlapping blocks
   - Visual warning in calendar interface

**Acceptance Criteria**:

- Sub-trainers can create and manage their own availability
- Primary trainers can view all team member calendars
- Calendar selector switches between trainer views correctly
- Client booking widget shows trainer selection
- Bookings correctly associated with selected trainer
- No scheduling conflicts for individual trainers
- Team calendar view displays multiple schedules clearly
- Color coding distinguishes trainers visually

---

### Iteration 7.4: Sub-Trainer Profile & Dashboard

**Duration**: 2 days

**User Stories**:

- As a sub-trainer, I want my own dashboard so that I see relevant statistics
- As a sub-trainer, I want to update my profile so that clients see accurate information
- As a primary trainer, I want to view sub-trainer profiles so that I can manage team information

**Technical Tasks**:

1. Create sub-trainer profile settings: `app/(dashboard)/settings/profile/page.tsx`
   - Same form as primary trainer but limited fields
   - Editable: Name, Bio, Phone, Profile photo
   - Read-only: Email, Business name (inherited from primary)
   - Cannot change subdomain or business-level settings

2. Customize dashboard for sub-trainers:
   - Stats widgets show only their bookings
   - "Your Bookings This Week" instead of "All Bookings"
   - Client count: Only clients they've served
   - No revenue tracking (business-level metric)
   - Welcome message: "Welcome back, [Name]"

3. Create sub-trainer detail page for primary: `app/(dashboard)/sub-trainers/[subTrainerId]/page.tsx`
   - Overview of sub-trainer's activity
   - Stats: Total bookings, Active clients, No-show rate
   - Recent bookings list
   - Performance metrics
   - Edit and deactivate buttons

4. Build sub-trainer directory for clients:
   - Public page showing team members
   - Display on trainer's landing page (optional section)
   - Each trainer: Photo, name, bio, specialties
   - Book button links to calendar filtered by trainer
   - Primary trainer can enable/disable this feature

5. Add sub-trainer bio to booking flow:
   - Show trainer bio when client selects them
   - Display credentials or certifications
   - Photo and brief description
   - Helps clients make informed choice

**Acceptance Criteria**:

- Sub-trainer dashboard shows relevant personal statistics
- Sub-trainers can update permitted profile fields
- Primary trainers can view detailed sub-trainer profiles
- Stats accurate and filtered to sub-trainer's bookings
- Sub-trainer directory displays correctly on landing page
- Trainer selection shows helpful information to clients

---

### Iteration 7.5: Activity Tracking & Reporting

**Duration**: 3 days

**User Stories**:

- As a primary trainer, I want to see sub-trainer activity so that I can monitor performance
- As a primary trainer, I want reports on team productivity so that I can identify trends
- As a sub-trainer, I want to see my own performance so that I can improve

**Technical Tasks**:

1. Create activity tracking system:
   - Track logins (last active timestamp)
   - Track bookings created (by trainer)
   - Track session completions
   - Track client interactions
   - Store in database or analytics service

2. Build team analytics page: `app/(dashboard)/sub-trainers/analytics/page.tsx`
   - Overview dashboard for all sub-trainers
   - Comparison table: Bookings, Completion rate, No-shows
   - Date range selector
   - Export to PDF/CSV
   - Charts showing trends

3. Create individual performance reports:
   - Accessible from sub-trainer detail page
   - Monthly/quarterly summary
   - Metrics: Bookings handled, Client satisfaction (future), Revenue generated (if tracked)
   - Downloadable report

4. Implement performance widgets:
   - Primary dashboard widget: "Team Performance"
   - Shows top performer, average bookings
   - Quick stats: Total team bookings this week
   - Click-through to full analytics

5. Add sub-trainer leaderboard (optional):
   - Friendly competition element
   - Rankings by bookings, completions, client retention
   - Gamification badges: "Top Performer", "Most Consistent"
   - Can be enabled/disabled by primary trainer

6. Create notification system for primary:
   - Alert when sub-trainer has unusual activity
   - Example: High cancellation rate, no logins for 7 days
   - Daily/weekly summary email option
   - Configure notification preferences

7. Build sub-trainer performance view:
   - Sub-trainers see their own stats
   - Personal goals and progress tracking
   - Comparison to team average (anonymized)
   - Motivational feedback

**Acceptance Criteria**:

- Activity tracking captures all relevant events
- Team analytics page displays accurate data
- Performance reports generate correctly
- Comparison metrics fair and useful
- Primary trainers receive activity alerts
- Sub-trainers can view their own performance
- Reports exportable in multiple formats

---

### Iteration 7.6: Deactivation & Offboarding

**Duration**: 2 days

**User Stories**:

- As a primary trainer, I want to deactivate sub-trainers so that former team members lose access
- As a primary trainer, I want to reassign bookings so that clients aren't affected by staff changes
- As a deactivated sub-trainer, I want to be notified so that I understand my access status

**Technical Tasks**:

1. Create deactivation flow:
   - "Deactivate" button on sub-trainer detail page
   - Confirmation modal with options
   - Options: Reassign future bookings, Cancel future bookings, Keep assigned
   - Warning about impact to clients

2. Implement deactivation API: `app/api/sub-trainers/[subTrainerId]/deactivate/route.ts`
   - POST: Accept deactivation reason and booking handling choice
   - Set user status to inactive
   - Block login access
   - Handle future bookings per selection
   - Send notification email to sub-trainer

3. Build booking reassignment system:
   - Modal listing all future bookings
   - Dropdown to select new trainer (primary or another sub)
   - Bulk reassign or individual selection
   - Send notifications to affected clients
   - Update booking records

4. Create reactivation flow:
   - "Reactivate" button for inactive sub-trainers
   - Restores access immediately
   - Sends welcome back email
   - Previous bookings and data preserved

5. Handle past bookings and data:
   - Preserve historical booking records
   - Keep in analytics for accuracy
   - Mark as "Former Sub-Trainer" in reports
   - Don't delete data (important for business records)

6. Add seat reclamation:
   - Deactivating sub-trainer frees up seat
   - Update seat count immediately
   - Allow new invitations if under limit

7. Create offboarding email: `emails/sub-trainer-deactivated.tsx`
   - Professional tone explaining deactivation
   - Reason (if provided by primary)
   - Access removal confirmation
   - Contact information for questions
   - Thank you for service message

**Acceptance Criteria**:

- Deactivated sub-trainers cannot log in
- Future bookings handled according to selection
- Client notifications sent for booking changes
- Reactivation restores full access
- Historical data preserved and attributed correctly
- Seat count updates when deactivating
- Offboarding email sent and professional

---

### Iteration 7.7: Testing & Edge Cases

**Duration**: 2 days

**Technical Tasks**:

1. Test invitation workflow:
   - Multiple simultaneous invitations
   - Expired token handling
   - Re-invitation after rejection
   - Duplicate email invitations prevented

2. Test permission enforcement:
   - Attempt unauthorized API calls as sub-trainer
   - Verify data isolation (can't access other trainers' bookings)
   - Test route protection comprehensively
   - Check for permission bypass vulnerabilities

3. Test calendar coordination:
   - Multiple trainers with same time slots
   - Conflicting availability blocks
   - Booking with specific trainer selection
   - Availability aggregation accuracy

4. Test deactivation scenarios:
   - Deactivate with pending bookings
   - Reactivate and verify access restoration
   - Seat limit enforcement after deactivation
   - Data integrity after multiple activate/deactivate cycles

5. Test tier limits:
   - Enforce seat limits for Pro tier
   - Unlimited seats for Enterprise
   - Upgrade prompt when limit reached
   - Additional seat purchase flow

6. Performance testing:
   - System with 10+ sub-trainers
   - Query performance for filtered data
   - Calendar view with multiple trainers
   - Analytics calculation speed

**Acceptance Criteria**:

- All invitation scenarios handled correctly
- Permission system secure and reliable
- Calendar functionality works with multiple trainers
- Deactivation and reactivation complete successfully
- Tier limits enforced properly
- System performs well with many sub-trainers
- No data leakage between trainers

---

## EPIC 7 Completion Criteria

By the end of this epic, TrainerDesk will have complete sub-trainer management with:

- ✅ Email invitation system with token-based acceptance
- ✅ Role-based permission system with API enforcement
- ✅ Separate calendar management per trainer
- ✅ Individual dashboards and profiles for sub-trainers
- ✅ Activity tracking and team analytics
- ✅ Deactivation and offboarding workflows
- ✅ Comprehensive testing and security validation

**Next Epic Preview**: EPIC 8 will implement Domain Management & Deployment, including custom domain connection with DNS verification, SSL certificate automation, subdomain routing optimization, and production deployment to Vercel with monitoring and analytics.

---
