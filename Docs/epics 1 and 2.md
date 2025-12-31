# TrainerDesk - Detailed Epics & Iterations

Based on the comprehensive requirements and technical documentation, here are the detailed epics and iterations for building TrainerDesk. This follows the tech stack (Next.js 14+, Prisma, PostgreSQL, NextAuth.js, Paddle, Resend, Twilio) and folder structure we've defined.[1][2]

---

## EPIC 1: Project Foundation & Authentication (Sprint 1 - Weeks 1-2)

### Epic Overview

Establish project infrastructure, database schema, and authentication system. This epic creates the foundational architecture for all subsequent features.

### Iteration 1.1: Project Setup & Configuration

**Duration**: 2 days

**User Stories**:

- As a developer, I need to initialize the Next.js project so that I have a working development environment
- As a developer, I need to configure TypeScript and ESLint so that code quality is maintained
- As a developer, I need to set up Tailwind CSS and shadcn/ui so that I can build consistent interfaces

**Technical Tasks**:

1. Run `npx create-next-app@latest trainerdesk --typescript --tailwind --app`
2. Install core dependencies:
   ```bash
   npm install @prisma/client prisma
   npm install next-auth@beta @auth/prisma-adapter
   npm install zod react-hook-form @hookform/resolvers
   npm install date-fns date-fns-tz
   npm install @tanstack/react-query
   ```
3. Initialize shadcn/ui: `npx shadcn-ui@latest init`
4. Install shadcn components: Button, Card, Dialog, Form, Input, Select, Table, Tabs, Badge, Avatar, Toast
5. Configure Tailwind with custom colors (blue-600 primary, gray scale)
6. Set up folder structure following documentation architecture
7. Create `.env.example` with required environment variables
8. Initialize Git repository and create `.gitignore`
9. Set up Prettier configuration for code formatting

**Acceptance Criteria**:

- Development server runs without errors on `localhost:3000`
- Tailwind CSS styling works with custom theme
- All shadcn/ui components render correctly
- TypeScript compilation succeeds with no errors
- Git repository initialized with proper ignore rules

---

### Iteration 1.2: Database Schema & Prisma Setup

**Duration**: 2 days

**User Stories**:

- As a developer, I need to define the database schema so that all models and relationships are established
- As a developer, I need to connect to PostgreSQL so that data can be persisted

**Technical Tasks**:

1. Create Neon or Supabase PostgreSQL database (free tier)
2. Add `DATABASE_URL` to `.env.local`
3. Initialize Prisma: `npx prisma init`
4. Create complete `prisma/schema.prisma` with all models:
   - User (authentication)
   - Trainer (business profiles)
   - Page (landing page configurations)
   - Availability (trainer schedules)
   - Client (customer records)
   - Booking (session reservations)
   - NotificationTemplate (email/SMS templates)
   - NotificationLog (delivery tracking)
5. Define enums: UserRole, SubscriptionTier, BookingStatus, NotificationType
6. Add indexes for performance: trainerId, subdomain, customDomain, email, startTime
7. Create Prisma client singleton in `lib/prisma.ts`
8. Run first migration: `npx prisma migrate dev --name init`
9. Generate Prisma Client: `npx prisma generate`
10. Test database connection with simple query

**Acceptance Criteria**:

- Database migrations run successfully
- Prisma Studio opens with `npx prisma studio` showing all tables
- Prisma Client can query database from Next.js API routes
- All relationships (one-to-many, self-referential) work correctly
- Indexes created for optimized queries

---

### Iteration 1.3: NextAuth.js Configuration

**Duration**: 3 days

**User Stories**:

- As a new trainer, I want to register with email and password so that I can create an account
- As a returning trainer, I want to log in with my credentials so that I can access my dashboard
- As a trainer, I want to reset my password if I forget it so that I can regain access

**Technical Tasks**:

1. Install NextAuth.js v5: `npm install next-auth@beta`
2. Create `lib/auth.ts` with NextAuth configuration:
   - Credentials provider for email/password
   - Prisma adapter for session storage
   - JWT strategy with role inclusion
   - Callbacks for user/session management
3. Create API route: `app/api/auth/[...nextauth]/route.ts`
4. Set up password hashing with bcryptjs: `npm install bcryptjs @types/bcryptjs`
5. Create Zod schemas in `lib/validations/auth.ts`:
   - LoginSchema (email, password)
   - RegisterSchema (email, password, name, businessName)
   - ResetPasswordSchema
6. Build registration API: `app/api/auth/register/route.ts`
   - Validate input with Zod
   - Check for existing user
   - Hash password
   - Create User and Trainer records
   - Generate unique subdomain from businessName
7. Create login page: `app/(auth)/login/page.tsx`
   - Form with React Hook Form
   - Client-side validation
   - Error message display
   - Link to register and forgot password
8. Create register page: `app/(auth)/register/page.tsx`
   - Multi-field form (name, email, business name, password)
   - Password strength indicator
   - Terms of service checkbox
9. Create forgot password flow:
   - Request page with email input
   - API route to generate reset token
   - Email with reset link (using Resend)
   - Reset page with new password form
10. Create auth layout: `app/(auth)/layout.tsx`
    - Centered card design
    - TrainerDesk logo
    - Background gradient

**Acceptance Criteria**:

- New trainers can successfully register and account is created in database
- Registered trainers can log in and session is established
- Invalid credentials show appropriate error messages
- Password reset email is sent and reset process completes successfully
- User redirected to dashboard after login
- Session persists across page refreshes
- Logout functionality clears session

---

## EPIC 2: Dashboard Layout & Core UI (Sprint 2 - Weeks 3-4)

### Iteration 2.1: Dashboard Layout Components

**Duration**: 3 days

**User Stories**:

- As a trainer, I want to see a navigation sidebar so that I can easily access different sections
- As a trainer, I want a header with my profile menu so that I can access account settings
- As a trainer, I want the interface to be responsive so that I can use it on mobile devices

**Technical Tasks**:

1. Create dashboard layout: `app/(dashboard)/layout.tsx`
   - Sidebar + main content area structure
   - Protected route middleware
   - Session check and redirect if unauthenticated
2. Build sidebar component: `components/layout/dashboard-sidebar.tsx`
   - Navigation items: Dashboard, Calendar, Bookings, Page Builder, Clients, Analytics, Settings
   - Active state highlighting
   - Icons from Lucide React: `npm install lucide-react`
   - Collapsible on mobile (hamburger menu)
   - Current plan badge at bottom (Free/Pro/Enterprise)
   - Upgrade CTA for Free users
3. Build header component: `components/layout/dashboard-header.tsx`
   - Breadcrumb navigation
   - User avatar with dropdown menu
   - Dropdown items: Profile, Settings, Billing, Help, Logout
   - Notification bell icon (placeholder for future)
4. Add mobile responsiveness:
   - Sidebar slides from left on mobile
   - Overlay backdrop when open
   - Close on navigation or backdrop click
5. Create shared components:
   - `components/shared/loading-spinner.tsx`
   - `components/shared/error-message.tsx`
   - `components/shared/empty-state.tsx`

**Acceptance Criteria**:

- Sidebar navigation works on desktop and mobile
- Active route highlighted in sidebar
- Header dropdown menu functions correctly
- Only authenticated users can access dashboard
- Layout is responsive from 320px to 2560px screens
- Logout functionality returns user to login page

---

### Iteration 2.2: Dashboard Homepage & Stats Widgets

**Duration**: 3 days

**User Stories**:

- As a trainer, I want to see key metrics at a glance so that I understand my business performance
- As a trainer, I want to see my upcoming bookings so that I know my schedule
- As a trainer, I want a welcome message so that the interface feels personalized

**Technical Tasks**:

1. Create dashboard page: `app/(dashboard)/dashboard/page.tsx`
   - Personalized greeting with time-based message
   - Grid layout for stats cards (4 columns on desktop, 1 on mobile)
   - Upcoming sessions section
   - Quick actions panel
2. Build stats card component: `components/dashboard/stats-card.tsx`
   - Reusable card accepting: title, value, icon, change percentage
   - Color-coded icons with background circle
   - Trending indicator (up/down arrow)
3. Create API route: `app/api/dashboard/stats/route.ts`
   - Query bookings count (today, week, month, all-time)
   - Calculate active clients count
   - Calculate no-show rate
   - Calculate completion rate
   - Return JSON response
4. Fetch stats with React Query: `npm install @tanstack/react-query`
   - Set up QueryClientProvider in root layout
   - Create custom hook `lib/hooks/use-dashboard-stats.ts`
   - Handle loading and error states
5. Build upcoming bookings list: `components/dashboard/booking-list.tsx`
   - Table showing next 5 bookings
   - Columns: Client Name, Date, Time, Duration, Status
   - Quick action buttons: View, Cancel, Mark Complete
   - Link to full calendar view
6. Create quick actions panel: `components/dashboard/quick-actions.tsx`
   - Buttons: Create Booking, Edit Page, View Page, Invite Sub-Trainer
   - Icons with labels
   - Conditional rendering based on subscription tier

**Acceptance Criteria**:

- Dashboard loads with real data from database
- Stats cards display accurate numbers
- Upcoming bookings show correct information
- Loading skeletons display while data fetches
- Error states handled gracefully
- Quick actions navigate to correct pages
- Mobile layout stacks vertically without horizontal scroll

---

### Iteration 2.3: Settings Pages Foundation

**Duration**: 2 days

**User Stories**:

- As a trainer, I want to update my profile information so that clients see accurate details
- As a trainer, I want to configure my timezone so that bookings display correctly

**Technical Tasks**:

1. Create settings layout: `app/(dashboard)/settings/page.tsx`
   - Hub page with cards linking to sub-sections
   - Sections: Profile, Booking Preferences, Notifications, Domain, Billing
2. Build profile settings page: `app/(dashboard)/settings/profile/page.tsx`
   - Form fields: Name, Business Name, Bio, Phone, Timezone
   - Profile photo upload (UploadThing integration)
   - Timezone selector with auto-detection
3. Install UploadThing: `npm install uploadthing @uploadthing/react`
4. Create upload API: `app/api/uploadthing/route.ts`
5. Create update profile API: `app/api/trainers/[trainerId]/route.ts`
   - PATCH endpoint
   - Zod validation for trainer profile
   - Update database record
   - Revalidate affected pages
6. Build timezone selector: `components/shared/timezone-selector.tsx`
   - Searchable dropdown
   - Grouped by region
   - Browser detection fallback

**Acceptance Criteria**:

- Profile form submits successfully and updates database
- Profile photo uploads and displays correctly
- Timezone changes reflect in booking times
- Validation errors display inline
- Success toast notification shows after save
- Settings hub navigation works correctly

---
