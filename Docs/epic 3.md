# EPIC 3: Booking System & Calendar (Sprint 3 - Weeks 5-7)

## Epic Overview

Build the core booking functionality including trainer availability management, client-facing calendar widget, booking creation, and basic booking management. This epic delivers the primary value proposition of TrainerDesk.

---

### Iteration 3.1: Availability Management System

**Duration**: 4 days

**User Stories**:

- As a trainer, I want to set my weekly availability so that clients can only book during my working hours
- As a trainer, I want to configure session durations so that clients can choose appropriate time slots
- As a trainer, I want to set buffer time between sessions so that I have time to prepare

**Technical Tasks**:

1. Create booking preferences page: `app/(dashboard)/settings/booking-preferences/page.tsx`
   - Section for session durations (checkboxes: 30, 45, 60, 90, 120 minutes)
   - Buffer time dropdown (0, 15, 30, 45 minutes)
   - Advance booking window inputs (minimum hours, maximum days)
   - Cancellation policy configuration
   - Rescheduling rules toggles
2. Create Zod validation schema: `lib/validations/booking.ts`
   - BookingPreferencesSchema
   - AvailabilityBlockSchema
   - BookingCreateSchema
3. Build API route: `app/api/trainers/[trainerId]/preferences/route.ts`
   - GET: Retrieve current preferences
   - PATCH: Update preferences with validation
   - Store preferences in Trainer model JSON field or separate table
4. Create availability grid page: `app/(dashboard)/calendar/page.tsx`
   - Weekly grid view (Monday-Sunday rows, hourly columns)
   - Click-and-drag to create availability blocks
   - Visual indicator of existing blocks
   - Toggle between weekly recurring and specific dates
5. Build availability grid component: `components/calendar/availability-grid.tsx`
   - Interactive time grid using HTML table or CSS Grid
   - Drag selection using mouse events
   - Touch support for mobile devices
   - Visual feedback during selection
6. Create availability API: `app/api/trainers/[trainerId]/availability/route.ts`
   - POST: Create new availability block
   - GET: Retrieve all availability blocks
   - DELETE: Remove availability block
   - Validate no overlapping blocks
7. Implement availability CRUD operations:
   - Store blocks in Availability model (dayOfWeek, startTime, endTime, isRecurring)
   - Handle recurring weekly patterns
   - Support one-time date overrides (holidays, special hours)
8. Add date override functionality:
   - Modal for adding specific date exceptions
   - "Block this date" option for holidays
   - "Override hours for [date]" option

**Acceptance Criteria**:

- Trainer can check multiple session durations and they save correctly
- Buffer time applies to calculated available slots
- Availability grid displays existing blocks accurately
- Trainer can create availability blocks by clicking and dragging
- Weekly recurring availability saves and persists across sessions
- Date-specific overrides display correctly on calendar
- No overlapping availability blocks allowed (validation error shown)
- Mobile touch interface works for availability creation

---

### Iteration 3.2: Slot Generation & Availability API

**Duration**: 3 days

**User Stories**:

- As a client, I want to see available time slots so that I can book a session
- As a trainer, I want slots to consider my buffer time so that I'm not double-booked
- As a client, I want to see times in my local timezone so that I don't miss my session

**Technical Tasks**:

1. Create slot generation logic in `lib/availability.ts`:
   - Function `generateAvailableSlots(trainerId, date, duration)`
   - Query Availability blocks for specific day of week
   - Check for date-specific overrides
   - Apply buffer time between slots
   - Exclude already booked time slots
   - Return array of available start times
2. Implement timezone conversion:
   - Store trainer timezone in Trainer model
   - Accept client timezone in API request
   - Convert availability blocks to client timezone using date-fns-tz
   - Display both timezones in UI for clarity
3. Create availability API endpoint: `app/api/bookings/availability/route.ts`
   - Query params: trainerId, date, duration, clientTimezone
   - Call slot generation function
   - Return JSON array of slots: `[{startTime, endTime, available: true}]`
   - Cache results for performance (5-minute TTL)
4. Add conflict checking:
   - Query existing bookings for date range
   - Mark slots as unavailable if booked
   - Consider booking status (CONFIRMED and PENDING block slots)
   - Handle concurrent booking attempts with database locking
5. Optimize query performance:
   - Add database indexes on trainerId and startTime
   - Use Prisma query optimization with select and include
   - Implement connection pooling for Neon/Supabase
6. Create unit tests for slot generation:
   - Test with various buffer times
   - Test timezone conversion accuracy
   - Test conflict detection
   - Test edge cases (midnight crossing, DST transitions)

**Acceptance Criteria**:

- API returns only genuinely available slots
- Buffer time is correctly applied between sessions
- Timezone conversion is accurate (test with multiple zones)
- Booked slots are excluded from availability
- API responds within 500ms for typical queries
- Edge cases (same trainer, same time) handled correctly
- Date-specific overrides work properly

---

### Iteration 3.3: Client-Facing Calendar Widget

**Duration**: 4 days

**User Stories**:

- As a client, I want to select a date and time so that I can book a session with my trainer
- As a client, I want to enter my contact information so that the trainer can reach me
- As a client, I want immediate confirmation so that I know my booking succeeded

**Technical Tasks**:

1. Install calendar library: `npm install react-big-calendar date-fns` or build custom
2. Create calendar widget component: `components/calendar/booking-calendar.tsx`
   - Month view with selectable dates
   - Clicking date shows available time slots
   - Duration selector if trainer offers multiple options
   - Slot display in client's detected timezone
   - "Book This Slot" button for each available time
3. Build booking form modal: `components/calendar/booking-form-modal.tsx`
   - Form fields: Name, Email, Phone, Notes (optional)
   - Selected date/time display with timezone indicator
   - React Hook Form with Zod validation
   - Privacy policy checkbox
   - Submit button with loading state
4. Implement timezone detection:
   - Use `Intl.DateTimeFormat().resolvedOptions().timeZone`
   - Display detected timezone with option to change
   - Store client timezone with booking for future reference
5. Create booking submission API: `app/api/bookings/route.ts`
   - POST endpoint for booking creation
   - Validate all required fields
   - Check slot still available (race condition prevention)
   - Use Prisma transaction for atomicity
   - Create Client record if new (or lookup existing by email)
   - Create Booking record with PENDING status
   - Return booking confirmation with ID
6. Implement optimistic locking:
   - Check slot availability within transaction
   - If slot taken, return 409 Conflict error
   - Client UI shows friendly message and refreshes slots
7. Add success confirmation:
   - Success modal with booking details
   - Unique booking ID displayed
   - "Add to Calendar" button (generates .ics file)
   - Instructions for next steps
8. Create calendar embed endpoint: `app/api/embed/calendar/[trainerId]/route.ts`
   - Returns iframe-compatible HTML with calendar widget
   - Styled to match trainer's page customization
   - CORS headers for cross-origin embedding

**Acceptance Criteria**:

- Calendar displays correctly with current month
- Available dates highlighted, unavailable dates grayed out
- Clicking available date shows time slots for all configured durations
- Time slots display in client's browser timezone
- Booking form validates all fields correctly
- Successful booking creates records in database
- Race condition handled (two clients booking same slot)
- Confirmation displays with correct booking details
- Calendar widget can be embedded in trainer's landing page

---

### Iteration 3.4: Booking Management (Trainer View)

**Duration**: 3 days

**User Stories**:

- As a trainer, I want to see all my bookings in a list so that I can manage my schedule
- As a trainer, I want to mark sessions as complete or no-show so that I can track attendance
- As a trainer, I want to cancel bookings if needed so that I can handle emergencies

**Technical Tasks**:

1. Create bookings page: `app/(dashboard)/calendar/bookings/page.tsx`
   - Table view with columns: Date, Time, Client, Duration, Status, Actions
   - Filter options: All, Upcoming, Past, Cancelled
   - Date range filter
   - Search by client name/email
   - Pagination for large datasets
2. Build bookings list component: `components/dashboard/booking-list.tsx`
   - Sortable table using shadcn Table component
   - Status badges with color coding (Pending=yellow, Confirmed=blue, Completed=green, Cancelled=red, No-Show=orange)
   - Action dropdown menu per row
3. Implement booking actions:
   - View details (opens modal with full information)
   - Mark as Complete (updates status, prompts for notes)
   - Mark as No-Show (updates status, used for analytics)
   - Cancel booking (opens confirmation dialog with reason input)
   - Reschedule (opens slot picker for new time)
4. Create booking detail modal: `components/calendar/booking-detail-modal.tsx`
   - Display all booking information
   - Client contact details (email, phone clickable)
   - Session notes from client
   - Booking history (created, confirmed, rescheduled)
   - Quick action buttons
5. Build status update API: `app/api/bookings/[bookingId]/status/route.ts`
   - PATCH endpoint accepting new status
   - Validate status transition (can't mark future booking as complete)
   - Update database with timestamp
   - Trigger notification to client if applicable
6. Create cancellation API: `app/api/bookings/[bookingId]/cancel/route.ts`
   - POST endpoint with cancellation reason
   - Check cancellation policy (time before session)
   - Update status and store cancelledAt timestamp
   - Send cancellation notification to client
   - Make slot available again
7. Add bulk actions:
   - Select multiple bookings with checkboxes
   - Bulk status update
   - Bulk export to CSV
8. Implement real-time updates:
   - Use React Query's refetchInterval for polling
   - Or implement WebSocket connection for live updates
   - Show toast notification when new booking received

**Acceptance Criteria**:

- Bookings list displays all trainer's bookings accurately
- Filters work correctly (status, date range, search)
- Status updates save and reflect immediately in UI
- Cancellation enforces policy (warning if within minimum notice)
- Booking details modal shows complete information
- Bulk actions work for selected bookings
- CSV export includes all relevant data
- Real-time updates show new bookings without page refresh

---

### Iteration 3.5: Rescheduling & Cancellation Flow

**Duration**: 3 days

**User Stories**:

- As a client, I want to reschedule my booking so that I don't lose my session if plans change
- As a client, I want to cancel my booking so that the slot becomes available for others
- As a trainer, I want to control reschedule/cancel policies so that I protect my time

**Technical Tasks**:

1. Create reschedule API: `app/api/bookings/[bookingId]/reschedule/route.ts`
   - POST endpoint accepting new startTime
   - Validate against reschedule policy (hours before session)
   - Check maximum reschedule count limit
   - Verify new slot is available
   - Update booking with transaction (lock to prevent conflicts)
   - Increment reschedule count
   - Send confirmation to client and notification to trainer
2. Build client reschedule page: `app/reschedule/[bookingId]/page.tsx`
   - Public route (no login required)
   - Verify booking ID is valid
   - Display current booking details
   - Show available slots for rescheduling
   - Confirm button with policy disclaimer
3. Implement cancellation policy enforcement:
   - Calculate hours between now and session start
   - Compare against trainer's minimum cancellation notice
   - Show warning if within notice period
   - For Pro/Enterprise: optional cancellation fee logic (future)
4. Create client cancellation page: `app/cancel/[bookingId]/page.tsx`
   - Public route with booking ID parameter
   - Display booking details
   - Cancellation reason dropdown/textarea
   - Policy warning if applicable
   - Confirm cancellation button
5. Add booking token for security:
   - Generate unique token when booking created
   - Include token in reschedule/cancel links sent via email
   - Validate token in public pages to prevent unauthorized changes
   - Store token hash in database for verification
6. Build reschedule modal for trainer: `components/calendar/reschedule-modal.tsx`
   - Opens from booking list
   - Shows available slots for same duration
   - Trainer can move booking to new time
   - Sends notification to client about change
7. Implement audit trail:
   - Create BookingHistory model (optional) or use JSON log
   - Track all changes: created, confirmed, rescheduled, cancelled
   - Display history in booking detail modal
   - Include actor (trainer vs client), timestamp, reason

**Acceptance Criteria**:

- Clients can access reschedule page with unique booking link
- Reschedule policy enforced (blocked if too close to session)
- New time slot verified as available before confirming
- Booking updates reflect immediately in trainer's calendar
- Cancellation makes slot available for other clients
- Cancellation reason captured and stored
- Trainer can reschedule on behalf of client
- All booking changes tracked in history log
- Email notifications sent for reschedule/cancel (hooks prepared for Iteration 5.x)

---

### Iteration 3.6: Multi-Trainer Scheduling Foundation

**Duration**: 2 days

**User Stories**:

- As a primary trainer, I want sub-trainers to have separate calendars so that we don't conflict
- As a sub-trainer, I want to manage only my bookings so that I focus on my clients
- As a client, I want to book with a specific trainer so that I get consistent coaching

**Technical Tasks**:

1. Extend availability system for sub-trainers:
   - Availability query filters by specific trainerId
   - Sub-trainers create their own availability blocks
   - Primary trainer can view all sub-trainers' schedules
2. Update slot generation to support trainer selection:
   - Client calendar widget shows trainer selector dropdown (if multiple trainers)
   - API accepts optional trainerId parameter
   - If not specified, shows aggregated availability of all trainers
3. Modify booking model association:
   - Booking.trainerId references specific trainer (primary or sub)
   - Client can filter booking history by trainer
4. Add calendar view switcher for primary trainer:
   - Dropdown in calendar page: "View: My Calendar / All Trainers / [Sub-Trainer Name]"
   - Filters bookings and availability based on selection
5. Implement permission checks:
   - Sub-trainers cannot access other trainers' bookings
   - Sub-trainers cannot modify primary trainer's availability
   - Middleware checks user role and trainerId
6. Create calendar comparison view:
   - Side-by-side calendar display for multiple trainers
   - Useful for primary trainer to coordinate schedules
   - Visual indicators for conflicts or gaps

**Acceptance Criteria**:

- Sub-trainers see only their own calendar and bookings
- Primary trainer can view all sub-trainers' schedules
- Client calendar widget shows trainer selection if multiple trainers available
- Bookings correctly associated with specific trainer
- Permission checks prevent unauthorized access
- Calendar switcher functions correctly for primary trainer
- No booking conflicts between trainers

---

### Iteration 3.7: Testing & Performance Optimization

**Duration**: 2 days

**Technical Tasks**:

1. Write unit tests for critical functions:
   - Slot generation logic (`lib/availability.ts`)
   - Timezone conversion accuracy
   - Booking conflict detection
   - Policy enforcement (cancellation, reschedule)
2. Implement API endpoint testing:
   - Test booking creation with various inputs
   - Test concurrent booking attempts (race conditions)
   - Test availability queries with different parameters
   - Test status update transitions
3. Performance optimization:
   - Add database indexes for frequently queried fields
   - Implement caching for availability queries (React Query on client, Redis optional on server)
   - Optimize Prisma queries with proper includes/selects
   - Analyze slow queries with Prisma query logging
4. Load testing:
   - Test concurrent users booking same slot
   - Test calendar widget with 100+ bookings
   - Measure API response times under load
5. User acceptance testing:
   - Create test trainer account with sample data
   - Walk through complete booking flow from client perspective
   - Test all booking management actions
   - Verify mobile responsiveness
6. Bug fixes and edge cases:
   - Handle daylight saving time transitions
   - Handle bookings near midnight (date boundary)
   - Handle international date line scenarios
   - Handle very long session durations (multi-hour)

**Acceptance Criteria**:

- All unit tests pass with >80% coverage for booking logic
- No race conditions in concurrent booking tests
- API endpoints respond within acceptable time limits (<500ms p95)
- Calendar handles large datasets without performance degradation
- Mobile experience is smooth and functional
- All identified edge cases handled correctly
- No critical bugs in booking flow

---

## EPIC 3 Completion Criteria

By the end of this epic, TrainerDesk will have a fully functional booking system with:

- ✅ Trainer availability management with weekly patterns and overrides
- ✅ Client-facing calendar widget with timezone support
- ✅ Booking creation, confirmation, and management
- ✅ Rescheduling and cancellation with policy enforcement
- ✅ Multi-trainer support foundation
- ✅ Comprehensive testing and optimization

**Next Epic Preview**: EPIC 4 will build the Page Builder & Templates system, allowing trainers to create and customize their public landing pages where the booking calendar widget will be embedded.

---

This completes EPIC 3 with detailed iterations covering approximately 3 weeks of development work. The booking system is the core value proposition of TrainerDesk and this epic ensures it's robust, scalable, and user-friendly for both trainers and their clients.
