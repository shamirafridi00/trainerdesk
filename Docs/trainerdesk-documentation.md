# TrainerDesk - Complete Technical Documentation

## Executive Summary

TrainerDesk is a SaaS platform enabling fitness trainers to manage client bookings, create custom landing pages, and automate communications. Built for solo trainers and small training businesses, the system provides subdomain hosting, subscription management, and white-label options with a focus on simplicity and professional aesthetics.[1]

---

## Product Requirements

### Business Objectives

- Launch MVP within 3 months as solo developer using AI-assisted code generation
- Acquire 100 paying trainers within first 6 months
- Provide tier-based subscription model (Free, Pro $14/month, Enterprise $49/month)
- Generate recurring revenue through Paddle subscription processing
- Enable trainers to monetize their services independently without platform commission

### Target Users

**Primary Trainer (Account Owner)**: Manages subscription, billing, sub-trainers, page customization, and all system settings. Full administrative access to analytics, booking configurations, and domain management.

**Sub-Trainer (Added by Primary)**: Limited access to personal schedule, availability management, and assigned client bookings. Cannot modify billing, add other trainers, or access account-level settings.

**Clients (No Portal Required)**: Book sessions through trainer's public landing page using calendar widget. Receive SMS/email confirmations and reminders. No login required - identified by email/phone. Can contact trainer directly via provided contact information.[2][3]

### Core Functional Requirements

#### FR1: Authentication & User Management

- Email/password registration with email verification
- Role-based access control (Primary Trainer, Sub-Trainer)
- Session management with secure JWT tokens via NextAuth.js
- Password reset functionality via email magic links
- Account deletion with data export option (GDPR compliance)

#### FR2: Subscription & Billing (Paddle Integration)

- Three-tier subscription model with feature gating
- Paddle Checkout overlay for seamless payment experience
- Automatic provisioning of features on successful payment
- Webhook handling for subscription events (created, updated, cancelled, payment_failed)
- Usage-based billing for additional SMS/email credits beyond tier limits
- Prorated upgrades/downgrades between tiers
- Invoice generation and payment history accessible in dashboard

#### FR3: Dashboard & Analytics

- Real-time booking statistics (today, week, month, all-time)
- Session completion tracking with manual status updates
- No-show rate calculation with trend visualization
- Peak booking times heatmap (day/hour analysis)
- Client retention metrics (new vs returning clients)
- Upcoming sessions list with quick actions (cancel, reschedule, mark complete)
- Export functionality for bookings and client data (CSV format)
- Monthly comparison charts showing growth trends

#### FR4: Page Builder & Templates

- 5 pre-made responsive templates (Minimal, Bold, Professional, Modern, Classic)
- Section-based editing with drag-and-drop reordering using dnd-kit library
- Customization options per section: colors, text, images, visibility toggles
- Available sections: Hero, Services Grid, About/Bio, Testimonials, FAQ, Contact Form, Calendar Widget (mandatory)
- Real-time preview during editing
- One-click publish to subdomain (trainername.yourapp.com)
- Template versioning with draft/published states
- Mobile-responsive design enforced across all templates

#### FR5: Booking System & Calendar

- Trainer-configured session durations (30, 45, 60, 90, 120 minutes)
- Buffer time between sessions (0, 15, 30, 45 minutes)
- Advance booking window (minimum 2 hours, maximum 30 days)
- Weekly recurring availability blocks with override dates
- Timezone detection and conversion for trainer and clients
- Real-time slot availability with conflict prevention via database locking
- Guest booking (no client login required)
- Booking confirmation with unique booking ID
- Cancellation with configurable policy (2-48 hours advance notice)
- Client-initiated rescheduling (one-time or limited attempts)
- Calendar embed widget with customizable colors and branding

#### FR6: Notification System

- Resend integration for email delivery (transactional + marketing)
- Twilio integration for SMS delivery with character counting
- Pre-built templates: Welcome, Booking Confirmation, Reminders, Cancellation, Rescheduling
- Template editor with variable insertion: {client_name}, {trainer_name}, {session_date}, {session_time}, {session_duration}, {booking_link}, {reschedule_link}, {cancel_link}
- Configurable reminder schedule (24hr, 2hr, 1hr before session)
- Automated sending via cron jobs checking upcoming bookings
- Manual send functionality for custom messages
- SMS/email delivery status tracking
- Credit usage monitoring with low-balance warnings

#### FR7: Sub-Trainer Management (Pro/Enterprise)

- Add sub-trainers with email invitations
- Assign individual availability schedules per sub-trainer
- Permission restrictions (no access to billing, account settings, other trainers' data)
- Booking assignment to specific sub-trainers
- Per-seat billing for additional sub-trainers beyond tier limits
- Sub-trainer activity logs visible to primary trainer

#### FR8: Domain Management

- Automatic subdomain generation from business name/username
- Custom domain connection with CNAME/A record instructions
- DNS verification via Vercel domain API
- Automatic SSL certificate provisioning through Let's Encrypt
- Domain status indicators (Active, Pending, Error)
- Multiple domains support (Enterprise tier only)

#### FR9: White-Label & Branding (Enterprise)

- Remove "Powered by TrainerDesk" footer watermark
- Custom email sender name and reply-to address
- Custom SMS sender ID (subject to Twilio verification)
- Brand color customization applied system-wide
- Custom logo upload for emails and landing pages

---

## Technology Stack & Library Justification

### Core Framework

**Next.js 14.2+ with App Router**

- **Why**: Unified full-stack framework eliminating separate frontend/backend. React Server Components reduce JavaScript bundle size. File-based routing simplifies project structure for AI code generation. Excellent TypeScript support catches errors at compile time.[1]
- **Installation**: `npx create-next-app@latest trainerdesk --typescript --tailwind --app`

### Language

**TypeScript 5.3+**

- **Why**: Type safety prevents runtime errors. Autocomplete improves development speed. AI agents generate more reliable TypeScript code with fewer bugs than plain JavaScript. Required for Prisma ORM integration.

### Database & ORM

**PostgreSQL 15+ (Hosted on Neon or Supabase)**

- **Why**: Relational data structure fits booking system requirements. JSON column support for flexible template configurations. Robust transaction handling prevents double-booking. Free tier provides 10GB storage sufficient for MVP.
- **Installation**: `npm install @neondatabase/serverless`

**Prisma ORM 5.8+**

- **Why**: Type-safe database queries generated from schema definition. Automatic migration generation. Excellent AI compatibility - agents understand Prisma schema syntax. Built-in connection pooling. Query optimization with relation loading.
- **Installation**: `npm install prisma @prisma/client`
- **Commands**: `npx prisma init`, `npx prisma migrate dev`, `npx prisma generate`

### Authentication

**NextAuth.js v5 (Auth.js)**

- **Why**: Native Next.js integration with App Router support. Built-in session management and JWT handling. Role-based access control through callbacks. Email provider for passwordless magic links. Supports credentials provider for email/password.
- **Installation**: `npm install next-auth@beta`
- **Configuration**: Custom pages for signin/signup, session callback for role assignment, database session storage via Prisma adapter

### UI Component Library

**shadcn/ui + Radix UI**

- **Why**: Un-opinionated component library copied into your codebase (not npm dependency). Full customization control. Built on Radix UI primitives ensuring accessibility. Your existing familiarity from previous projects. Beautiful default styling with Tailwind CSS integration.[2]
- **Installation**: `npx shadcn-ui@latest init`
- **Components to install**: Button, Card, Dialog, Form, Input, Select, Table, Tabs, Calendar, Dropdown Menu, Toast, Badge, Avatar, Skeleton

**Tailwind CSS 3.4+**

- **Why**: Utility-first CSS reduces custom stylesheet complexity. Responsive design with mobile-first approach. PurgeCSS removes unused styles for optimal bundle size. JIT compiler enables arbitrary values. Your existing proficiency.[3]
- **Configuration**: Custom color palette matching brand, extended spacing for consistent layouts, custom font family integration

### Animations

**Framer Motion 11+**

- **Why**: Declarative animation API works seamlessly with React. Smooth page transitions enhance user experience. Drag gesture support for page builder reordering. Layout animations for responsive elements. Your previous usage experience.
- **Installation**: `npm install framer-motion`
- **Use cases**: Page builder section drag animations, modal enter/exit transitions, dashboard stat counter animations, calendar slot fade-in effects

### Payment Processing

**Paddle.js SDK**

- **Why**: Merchant of record handles tax compliance (VAT, sales tax) globally. SCA-compliant checkout reduces failed payments. Subscription management with automatic retries. Transparent pricing with no hidden fees. Webhook reliability for subscription events.
- **Installation**: `npm install @paddle/paddle-js`
- **Integration**: Overlay checkout for seamless UX, webhook endpoint at `/api/webhooks/paddle`, subscription status syncing to database, usage-based billing for SMS/email credits

### Email Service

**Resend SDK**

- **Why**: Developer-first API with React email template support. 3,000 free emails/month on free tier. 99.9% deliverability through AWS SES infrastructure. Simple authentication with API keys. Detailed delivery analytics and bounce tracking.
- **Installation**: `npm install resend`
- **Configuration**: Domain verification via DNS TXT record, custom "From" addresses, template storage in database with variable replacement

### SMS Service

**Twilio SDK**

- **Why**: Industry-standard reliability with 99.95% uptime. Pay-as-you-go pricing with no monthly minimums. Programmable SMS API with delivery status webhooks. Short code and long code number support. International delivery to 200+ countries.
- **Installation**: `npm install twilio`
- **Configuration**: Account SID and Auth Token in environment variables, phone number purchase for sender ID, webhook endpoint for delivery receipts

### Page Builder

**dnd-kit**

- **Why**: Modern drag-and-drop library with accessibility built-in. Touch device support for mobile editing. Modular architecture allows custom sensors. Better performance than react-dnd. TypeScript support included.
- **Installation**: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
- **Implementation**: Sortable sections list, drag overlay preview, drop animation, collision detection for valid drop zones

### Calendar Widget

**react-big-calendar or FullCalendar**

- **Why**: Pre-built calendar views (month, week, day, agenda). Timezone-aware date handling. Event styling customization. Click handlers for slot selection. Responsive design for mobile devices.
- **Installation**: `npm install react-big-calendar date-fns` or `npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid`
- **Alternative**: Build custom calendar using date-fns for lighter bundle size and full control

### Date/Time Utilities

**date-fns 3.0+**

- **Why**: Modular functions reduce bundle size (tree-shaking). Immutable date handling prevents bugs. Timezone support via date-fns-tz. Locale support for internationalization. Better performance than Moment.js.
- **Installation**: `npm install date-fns date-fns-tz`

### Form Handling

**React Hook Form 7.49+**

- **Why**: Minimal re-renders improve performance. Built-in validation with Zod schema integration. TypeScript support for type-safe forms. Uncontrolled components reduce boilerplate. Excellent DX for complex forms.
- **Installation**: `npm install react-hook-form @hookform/resolvers zod`

### Data Validation

**Zod 3.22+**

- **Why**: TypeScript-first schema validation. Inferred types eliminate duplication. Composable schemas for reusable validation. Runtime type checking prevents bad data. Integrates with React Hook Form.
- **Installation**: `npm install zod`

### Charts & Visualization

**Recharts 2.10+**

- **Why**: React-native charts with declarative API. Responsive charts adapt to container size. Customizable styling matches design system. Supports line, bar, pie, area charts. Lightweight compared to Chart.js.
- **Installation**: `npm install recharts`
- **Use cases**: Booking trend line charts, no-show rate pie charts, peak hours heatmap, revenue tracking bar charts

### Scheduled Jobs

**Vercel Cron Jobs** (for Vercel deployment)

- **Why**: Native integration with Vercel deployment platform. Configuration via vercel.json. No additional infrastructure required. Free on Pro plan. Reliable execution at scheduled intervals.
- **Configuration**: Create `/app/api/cron/send-reminders/route.ts` endpoint, add cron schedule to `vercel.json`: `"crons": [{"path": "/api/cron/send-reminders", "schedule": "*/15 * * * *"}]`

**Alternative: Inngest** (for complex workflows)

- **Why**: Event-driven architecture for multi-step workflows. Built-in retry logic and error handling. Local development experience. Free tier includes 25,000 events/month.
- **Installation**: `npm install inngest`

### File Uploads

**UploadThing**

- **Why**: Next.js-native file upload solution. S3-compatible storage. Image optimization and transformation. 2GB free storage. Simple API with TypeScript support.
- **Installation**: `npm install uploadthing @uploadthing/react`
- **Use cases**: Trainer profile photos, custom template images, brand logo uploads

### Markdown Processing (for content pages)

**MDX or react-markdown**

- **Why**: Render help documentation and blog content. Component embedding in markdown. Syntax highlighting for code examples.
- **Installation**: `npm install @next/mdx @mdx-js/loader @mdx-js/react`

### Testing (Optional for MVP, recommended post-launch)

**Vitest + React Testing Library**

- **Why**: Fast test execution with Vite-powered runner. Jest-compatible API. Component testing for React. Better TypeScript support than Jest.
- **Installation**: `npm install -D vitest @testing-library/react @testing-library/jest-dom`

### Code Quality

**ESLint + Prettier**

- **Why**: Automated code formatting eliminates style debates. Catches common errors before runtime. Consistent codebase for AI-generated code integration.
- **Installation**: Included with create-next-app, configure `.eslintrc.json` and `.prettierrc`

---

## Folder Structure & Rationale

```
trainerdesk/
├── app/                                    # Next.js App Router (routes & layouts)
│   ├── (auth)/                             # Route group for authentication pages
│   │   ├── login/
│   │   │   └── page.tsx                    # Login page
│   │   ├── register/
│   │   │   └── page.tsx                    # Registration page
│   │   ├── forgot-password/
│   │   │   └── page.tsx                    # Password reset request
│   │   └── layout.tsx                      # Shared layout for auth pages (centered, no nav)
│   │
│   ├── (dashboard)/                        # Route group for authenticated dashboard
│   │   ├── dashboard/
│   │   │   └── page.tsx                    # Main dashboard with stats widgets
│   │   ├── calendar/
│   │   │   ├── page.tsx                    # Availability management
│   │   │   └── bookings/
│   │   │       └── page.tsx                # Upcoming bookings list
│   │   ├── page-builder/
│   │   │   ├── page.tsx                    # Template selector
│   │   │   ├── edit/
│   │   │   │   └── [templateId]/
│   │   │   │       └── page.tsx            # Template editor with section drag-drop
│   │   │   └── preview/
│   │   │       └── [templateId]/
│   │   │           └── page.tsx            # Live preview iframe
│   │   ├── clients/
│   │   │   ├── page.tsx                    # Client list with search/filter
│   │   │   └── [clientId]/
│   │   │       └── page.tsx                # Individual client booking history
│   │   ├── sub-trainers/                   # Pro/Enterprise only
│   │   │   ├── page.tsx                    # Sub-trainer management
│   │   │   └── [trainerId]/
│   │   │       └── page.tsx                # Sub-trainer details & permissions
│   │   ├── notifications/
│   │   │   ├── page.tsx                    # Notification template list
│   │   │   └── [templateId]/
│   │   │       └── page.tsx                # Template editor with variables
│   │   ├── analytics/
│   │   │   └── page.tsx                    # Detailed analytics with charts
│   │   ├── settings/
│   │   │   ├── page.tsx                    # Account settings hub
│   │   │   ├── profile/
│   │   │   │   └── page.tsx                # Trainer profile (name, bio, photo)
│   │   │   ├── booking-preferences/
│   │   │   │   └── page.tsx                # Session durations, buffer time, policies
│   │   │   ├── domain/
│   │   │   │   └── page.tsx                # Custom domain connection (Pro+)
│   │   │   └── billing/
│   │   │       └── page.tsx                # Subscription management, invoices
│   │   └── layout.tsx                      # Dashboard layout (sidebar, header, user menu)
│   │
│   ├── (public)/                           # Route group for public-facing pages
│   │   ├── page.tsx                        # Marketing landing page for Trainerdesk
│   │   ├── pricing/
│   │   │   └── page.tsx                    # Pricing table with tier comparison
│   │   ├── features/
│   │   │   └── page.tsx                    # Feature showcase
│   │   ├── help/
│   │   │   ├── page.tsx                    # Help center hub
│   │   │   └── [slug]/
│   │   │       └── page.tsx                # Individual help articles (MDX)
│   │   └── layout.tsx                      # Public layout (marketing nav, footer)
│   │
│   ├── api/                                # API routes (serverless functions)
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts                # NextAuth.js handler
│   │   ├── bookings/
│   │   │   ├── route.ts                    # POST: Create booking, GET: List bookings
│   │   │   ├── [bookingId]/
│   │   │   │   ├── route.ts                # GET/PATCH/DELETE single booking
│   │   │   │   ├── cancel/
│   │   │   │   │   └── route.ts            # POST: Cancel booking
│   │   │   │   └── reschedule/
│   │   │   │       └── route.ts            # POST: Reschedule booking
│   │   │   └── availability/
│   │   │       └── route.ts                # GET: Available slots for trainer
│   │   ├── trainers/
│   │   │   ├── [trainerId]/
│   │   │   │   ├── route.ts                # GET/PATCH trainer profile
│   │   │   │   ├── availability/
│   │   │   │   │   └── route.ts            # POST/PATCH availability blocks
│   │   │   │   └── sub-trainers/
│   │   │   │       └── route.ts            # POST: Add sub-trainer, GET: List
│   │   │   └── pages/
│   │   │       └── [pageId]/
│   │   │           └── route.ts            # GET/PATCH page configuration
│   │   ├── notifications/
│   │   │   ├── send/
│   │   │   │   └── route.ts                # POST: Send notification (manual)
│   │   │   └── templates/
│   │   │       ├── route.ts                # GET: List templates, POST: Create
│   │   │       └── [templateId]/
│   │   │           └── route.ts            # GET/PATCH/DELETE template
│   │   ├── subscriptions/
│   │   │   ├── checkout/
│   │   │   │   └── route.ts                # POST: Create Paddle checkout session
│   │   │   ├── portal/
│   │   │   │   └── route.ts                # GET: Paddle customer portal URL
│   │   │   └── usage/
│   │   │       └── route.ts                # GET: Current SMS/email usage
│   │   ├── webhooks/
│   │   │   ├── paddle/
│   │   │   │   └── route.ts                # POST: Paddle webhook handler
│   │   │   ├── resend/
│   │   │   │   └── route.ts                # POST: Email delivery status
│   │   │   └── twilio/
│   │   │       └── route.ts                # POST: SMS delivery status
│   │   ├── cron/
│   │   │   ├── send-reminders/
│   │   │   │   └── route.ts                # Scheduled job: Check upcoming bookings
│   │   │   └── cleanup-sessions/
│   │   │       └── route.ts                # Scheduled job: Mark past sessions complete
│   │   └── uploadthing/
│   │       └── route.ts                    # UploadThing file upload handler
│   │
│   ├── [subdomain]/                        # Dynamic route for trainer subdomains
│   │   └── page.tsx                        # Trainer's public landing page
│   │
│   ├── globals.css                         # Global styles, Tailwind imports
│   ├── layout.tsx                          # Root layout (providers, fonts, metadata)
│   └── error.tsx                           # Global error boundary
│
├── components/                             # Reusable React components
│   ├── ui/                                 # shadcn/ui components (auto-generated)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   └── ... (all shadcn components)
│   │
│   ├── dashboard/                          # Dashboard-specific components
│   │   ├── stats-card.tsx                  # Reusable stat widget (bookings, revenue)
│   │   ├── booking-list.tsx                # Upcoming bookings table
│   │   ├── recent-clients.tsx              # Recent client activity
│   │   └── quick-actions.tsx               # Dashboard action buttons
│   │
│   ├── page-builder/                       # Page builder components
│   │   ├── section-editor.tsx              # Drag-drop section list
│   │   ├── section-preview.tsx             # Real-time preview renderer
│   │   ├── customization-panel.tsx         # Right sidebar with section options
│   │   ├── sections/                       # Individual section components
│   │   │   ├── hero-section.tsx
│   │   │   ├── services-section.tsx
│   │   │   ├── testimonials-section.tsx
│   │   │   ├── faq-section.tsx
│   │   │   └── calendar-section.tsx        # Booking widget embed
│   │   └── templates/                      # Pre-made template definitions
│   │       ├── minimal-template.tsx
│   │       ├── bold-template.tsx
│   │       ├── professional-template.tsx
│   │       ├── modern-template.tsx
│   │       └── classic-template.tsx
│   │
│   ├── calendar/                           # Calendar-related components
│   │   ├── availability-grid.tsx           # Weekly availability editor
│   │   ├── booking-calendar.tsx            # Client-facing calendar widget
│   │   ├── slot-picker.tsx                 # Time slot selection UI
│   │   └── timezone-selector.tsx           # Timezone dropdown with detection
│   │
│   ├── notifications/                      # Notification components
│   │   ├── template-editor.tsx             # WYSIWYG-style template editor
│   │   ├── variable-picker.tsx             # Variable insertion buttons
│   │   └── preview-panel.tsx               # Template preview with sample data
│   │
│   ├── analytics/                          # Analytics visualization
│   │   ├── booking-trend-chart.tsx         # Line chart (Recharts)
│   │   ├── peak-hours-heatmap.tsx          # Heatmap visualization
│   │   ├── no-show-pie-chart.tsx           # Pie chart for session status
│   │   └── retention-metric.tsx            # Client retention widget
│   │
│   ├── layout/                             # Layout components
│   │   ├── dashboard-sidebar.tsx           # Collapsible sidebar with nav
│   │   ├── dashboard-header.tsx            # Top header with user menu
│   │   ├── marketing-nav.tsx               # Public site navigation
│   │   └── footer.tsx                      # Site footer
│   │
│   └── shared/                             # Shared utility components
│       ├── loading-spinner.tsx             # Loading state indicator
│       ├── error-message.tsx               # Error display with retry
│       ├── empty-state.tsx                 # Empty state illustrations
│       ├── upgrade-badge.tsx               # "Pro" badge for locked features
│       ├── tier-comparison-table.tsx       # Pricing tier comparison
│       └── onboarding-tooltip.tsx          # Feature tour tooltips
│
├── lib/                                    # Utility functions & configurations
│   ├── prisma.ts                           # Prisma client singleton
│   ├── auth.ts                             # NextAuth.js configuration
│   ├── paddle.ts                           # Paddle SDK initialization
│   ├── resend.ts                           # Resend client configuration
│   ├── twilio.ts                           # Twilio client configuration
│   ├── utils.ts                            # General utility functions (cn, formatDate)
│   ├── validations/                        # Zod schemas
│   │   ├── booking.ts                      # Booking create/update schemas
│   │   ├── trainer.ts                      # Trainer profile schemas
│   │   ├── notification.ts                 # Notification template schemas
│   │   └── auth.ts                         # Login/register schemas
│   ├── hooks/                              # Custom React hooks
│   │   ├── use-subscription.ts             # Get current subscription tier
│   │   ├── use-feature-gate.ts             # Check feature access by tier
│   │   ├── use-toast.ts                    # shadcn toast notifications
│   │   └── use-media-query.ts              # Responsive breakpoint detection
│   └── constants.ts                        # App-wide constants (tiers, durations)
│
├── prisma/                                 # Database schema & migrations
│   ├── schema.prisma                       # Database models (Trainer, Booking, etc.)
│   ├── migrations/                         # Auto-generated migration files
│   │   └── 20260101000000_init/
│   │       └── migration.sql
│   └── seed.ts                             # Database seeding script (optional)
│
├── public/                                 # Static assets
│   ├── images/                             # Image assets
│   │   ├── logo.svg                        # TrainerDesk logo (create text base)
│   │   ├── templates/                      # Template preview thumbnails
│   │   │   ├── minimal.png
│   │   │   ├── bold.png
│   │   │   └── ...
│   │   └── illustrations/                  # Empty state illustrations
│   ├── fonts/                              # Custom web fonts (if any)
│   └── favicon.ico                         # Site favicon
│
├── content/                                # MDX content for help articles
│   └── help/
│       ├── getting-started.mdx
│       ├── connecting-domain.mdx
│       └── ...
│
├── middleware.ts                           # Next.js middleware (subdomain routing)
├── next.config.js                          # Next.js configuration
├── tailwind.config.ts                      # Tailwind CSS configuration
├── tsconfig.json                           # TypeScript configuration
├── package.json                            # Dependencies & scripts
├── .env.example                            # Environment variables template
├── .gitignore                              # Git ignore rules
├── vercel.json                             # Vercel deployment & cron configuration
└── README.md                               # Project documentation
```

### Folder Structure Rationale

**Route Groups in `/app`**: Parentheses syntax like `(auth)` and `(dashboard)` group related routes without adding URL segments. Allows separate layouts for authentication pages (centered, minimal) versus dashboard pages (sidebar layout) without nested URL paths.[1]

**API Routes Organized by Resource**: Each resource (bookings, trainers, notifications) has dedicated folder with CRUD operations. Nested routes like `/api/bookings/[bookingId]/cancel` keep related actions together. Makes AI code generation more predictable.

**Component Organization by Feature**: Instead of generic `components/buttons` and `components/forms`, organize by feature domain (dashboard, page-builder, calendar). Reduces cognitive load when finding components. Each feature folder is self-contained with related UI elements.

**Separation of UI Components**: The `components/ui` folder contains only shadcn/ui components (design system primitives). Custom components live outside preventing mixing of third-party and application code. Easy to update shadcn components without affecting custom logic.

**Lib Folder for Business Logic**: Keeps API routes thin by extracting business logic to `/lib`. Database queries, external API calls, and complex calculations live in reusable functions. Improves testability and code reuse across API routes and Server Actions.

**Prisma at Root Level**: Convention established by Prisma CLI. Keeps database schema visible and accessible. Migrations folder tracks schema evolution over time. Seed script useful for development data.

**Public for Static Assets**: Next.js automatically serves files from `/public` at root URL. Template preview images accessible at `/images/templates/minimal.png`. No special routing configuration needed.

**Middleware for Subdomain Routing**: Single `middleware.ts` file intercepts all requests. Extracts subdomain from hostname, queries database for trainer, rewrites to dynamic route `[subdomain]/page.tsx`. Enables trainer landing pages at custom subdomains.

---

## Database Schema Design

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  PRIMARY_TRAINER
  SUB_TRAINER
}

enum SubscriptionTier {
  FREE
  PRO
  ENTERPRISE
}

enum BookingStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
  NO_SHOW
}

enum NotificationType {
  EMAIL
  SMS
  BOTH
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  name          String
  role          UserRole @default(PRIMARY_TRAINER)

  trainerId     String?  @unique
  trainer       Trainer? @relation(fields: [trainerId], references: [id], onDelete: Cascade)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([email])
}

model Trainer {
  id                String            @id @default(cuid())
  businessName      String
  subdomain         String            @unique
  customDomain      String?           @unique
  bio               String?
  profilePhoto      String?
  timezone          String            @default("UTC")

  subscriptionTier  SubscriptionTier  @default(FREE)
  paddleCustomerId  String?           @unique
  paddleSubscriptionId String?        @unique
  subscriptionStatus String?          // active, cancelled, past_due
  subscriptionEndsAt DateTime?

  smsCredits        Int               @default(10)
  emailCredits      Int               @default(50)

  user              User?
  primaryTrainerId  String?
  primaryTrainer    Trainer?          @relation("SubTrainers", fields: [primaryTrainerId], references: [id], onDelete: Cascade)
  subTrainers       Trainer[]         @relation("SubTrainers")

  pages             Page[]
  bookings          Booking[]
  availabilities    Availability[]
  notificationTemplates NotificationTemplate[]
  clients           Client[]

  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  @@index([subdomain])
  @@index([customDomain])
}

model Page {
  id          String   @id @default(cuid())
  trainerId   String
  trainer     Trainer  @relation(fields: [trainerId], references: [id], onDelete: Cascade)

  templateId  String   // minimal, bold, professional, modern, classic
  sections    Json     // Array of section configurations
  published   Boolean  @default(false)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([trainerId])
}

model Availability {
  id          String   @id @default(cuid())
  trainerId   String
  trainer     Trainer  @relation(fields: [trainerId], references: [id], onDelete: Cascade)

  dayOfWeek   Int      // 0-6 (Sunday-Saturday)
  startTime   String   // "09:00"
  endTime     String   // "17:00"

  overrideDate DateTime? // Specific date override (optional)
  isRecurring Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([trainerId, dayOfWeek])
}

model Client {
  id          String    @id @default(cuid())
  email       String
  name        String
  phone       String?

  trainerId   String
  trainer     Trainer   @relation(fields: [trainerId], references: [id], onDelete: Cascade)

  bookings    Booking[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([email, trainerId])
  @@index([trainerId])
}

model Booking {
  id          String        @id @default(cuid())

  trainerId   String
  trainer     Trainer       @relation(fields: [trainerId], references: [id], onDelete: Cascade)

  clientId    String
  client      Client        @relation(fields: [clientId], references: [id], onDelete: Cascade)

  startTime   DateTime
  endTime     DateTime
  duration    Int           // minutes
  timezone    String

  status      BookingStatus @default(PENDING)

  notes       String?
  cancelledAt DateTime?
  cancelReason String?

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([trainerId, startTime])
  @@index([clientId])
}

model NotificationTemplate {
  id          String           @id @default(cuid())
  trainerId   String
  trainer     Trainer          @relation(fields: [trainerId], references: [id], onDelete: Cascade)

  name        String           // "Booking Confirmation", "24hr Reminder"
  type        NotificationType

  subject     String?          // For emails only
  body        String           // Template with variables

  isActive    Boolean          @default(true)

  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@index([trainerId])
}

model NotificationLog {
  id          String   @id @default(cuid())

  bookingId   String?
  clientEmail String?
  clientPhone String?

  type        NotificationType
  status      String   // sent, failed, delivered, bounced
  provider    String   // resend, twilio

  sentAt      DateTime @default(now())

  @@index([bookingId])
}
```

**Schema Design Decisions**:

- **User-Trainer Separation**: User handles authentication, Trainer handles business logic. Allows future expansion to different user types (admins, support).
- **Self-Referential Trainer Relation**: `primaryTrainerId` creates hierarchy for sub-trainers. Sub-trainers inherit primary's subscription benefits.
- **JSON Sections in Page**: Flexible schema for template sections. Stores configuration like `{type: "hero", headline: "...", bgColor: "#fff"}` without rigid columns.
- **Availability Blocks**: Recurring patterns (dayOfWeek) with optional date overrides for one-time changes. Efficient querying for slot generation.
- **Client Model**: Tracks unique clients per trainer. Enables retention metrics and booking history without requiring client login.
- **NotificationLog**: Audit trail for sent notifications. Tracks delivery status from webhooks. Useful for debugging and compliance.

---

## UI/UX Design Guidelines for Professional Aesthetic

### Design Principles

**Minimalism with Purpose**: Every element serves functional purpose. Remove decorative elements that don't aid user understanding. White space creates breathing room and draws attention to important actions like "Create Booking" or "Publish Page".[3]

**Visual Hierarchy**: Use size, color, and spacing to establish importance. Primary actions (Save, Publish, Book Now) use bold button with accent color. Secondary actions (Cancel, Preview) use ghost or outline buttons. Tertiary actions (Delete, Archive) use subtle text links.

**Consistent Design Language**: All components follow shadcn/ui design system ensuring visual consistency. Button heights, input padding, card border radius remain uniform across dashboard. Reduces cognitive load for trainers learning interface.[2]

**Progressive Disclosure**: Show essential information first, hide advanced options behind toggles or accordions. Booking Preferences page displays common settings (session durations) prominently, buffer time and timezone in collapsed sections until needed.

**Responsive by Default**: Every component built mobile-first. Dashboard sidebar collapses to hamburger menu on tablets. Page builder switches from side-by-side preview to stacked sections on mobile. Forms use full-width inputs with proper touch targets (44px minimum).

### Color Palette

**Primary Brand Color**: `#2563eb` (blue-600 in Tailwind) - Professional, trustworthy. Used for CTAs, active nav items, links.

**Success States**: `#10b981` (green-500) - Booking confirmations, published status, completed sessions.

**Warning States**: `#f59e0b` (amber-500) - Approaching credit limits, payment due soon, pending verifications.

**Error States**: `#ef4444` (red-500) - Failed payments, no-show bookings, validation errors.

**Neutral Grays**: Background `#f9fafb` (gray-50), cards `#ffffff`, borders `#e5e7eb` (gray-200), text `#111827` (gray-900).

**Accent Gradient**: Subtle gradient from `#2563eb` to `#3b82f6` for hero sections and premium features. Applied via Tailwind: `bg-gradient-to-r from-blue-600 to-blue-500`.

### Typography

**Font Stack**: Inter (primary), system-ui (fallback). Clean, highly legible, professional aesthetic. Excellent readability at small sizes for dashboard data.

**Hierarchy**: Page titles use `text-3xl font-bold`, section headings `text-xl font-semibold`, body text `text-base`, labels `text-sm text-gray-600`, captions `text-xs text-gray-500`.

**Line Height**: Generous line spacing for readability. Headings use `leading-tight`, body text `leading-relaxed`.

### Component Styling

**Cards**: White background, subtle shadow (`shadow-sm`), rounded corners (`rounded-lg`), 1px border (`border border-gray-200`). Hover state adds `shadow-md` for interactivity indication.

**Buttons**: Primary buttons use solid fill with accent color, rounded corners, padding `px-4 py-2`, font weight `font-medium`. Disabled state reduces opacity to 50% with cursor-not-allowed.

**Forms**: Labels above inputs, helper text below in gray, error messages in red with icon. Group related inputs with fieldset borders. Inline validation with green checkmark on valid input.

**Tables**: Zebra striping for rows (`odd:bg-gray-50`), sticky header on scroll, sortable columns with arrow indicators, row hover state highlights.

**Modals**: Centered overlay with backdrop blur (`backdrop-blur-sm`), white card with shadow-xl, close button in top-right, actions aligned right at bottom.

### Dashboard Layout

**Sidebar Navigation**: Fixed left sidebar (256px width) with collapsible sections. Active item indicated by accent background. Icons from Lucide React. Bottom of sidebar shows current plan badge and upgrade CTA for Free users.

**Main Content Area**: Max width 1280px with auto margins for readability on large screens. Padding `p-6`. Page title with breadcrumb navigation at top.

**Stats Widgets**: Grid of 4 cards showing key metrics (Total Bookings, Active Clients, This Month Revenue, No-Show Rate). Icon with colored background circle, large number display, change percentage in small text below.

**Empty States**: Illustration (from unDraw or similar) with heading "No bookings yet" and CTA button "Create your first booking". Welcoming tone encourages action without feeling like error.

### Page Builder Interface

**Split View**: Left side shows section list with drag handles, right side shows live preview in iframe. Resize handle between panels allows adjustment.

**Section Cards**: Each section displayed as card with thumbnail preview, section name, and action buttons (Edit, Remove, Duplicate). Drag handle indicates reorderability.

**Customization Panel**: Opens as right slide-over when editing section. Tabs for Content, Styling, Advanced. Color pickers use color wheel or preset palette. Image upload shows preview thumbnail with replace button.

**Template Gallery**: Grid of template cards with large preview image, template name, "Use Template" button. Hover shows expanded preview in modal.

### Onboarding & Guidance

**Welcome Tour**: First login triggers interactive tooltip tour highlighting key features. "Next" and "Skip" buttons allow progression or dismissal. Stores completion in localStorage to avoid repetition.

**Contextual Help**: Question mark icon next to complex settings opens popover with explanation. Example: "Buffer Time" label has `(?)` icon explaining "Time blocked after each session for preparation".

**Feature Highlights**: New features announced with subtle badge "New" next to nav item. Clicking shows modal explaining feature with screenshot and "Try it now" CTA.

**Progressive Onboarding**: Rather than overwhelming with 10-step wizard, guide users through tasks contextually. Empty calendar shows "Set your availability" CTA. Empty page builder shows "Choose a template" prompt.

**Video Tutorials**: Help section includes embedded 1-2 minute Loom videos showing common tasks: "Setting up your first booking", "Customizing your landing page", "Connecting custom domain".

### Content Strategy for Value Maximization

**Dashboard Welcome Message**: Personalized greeting "Good morning, [Name]!" with suggestion based on time/day: "You have 3 sessions scheduled today" or "Quiet day - great time to optimize your page".

**Empty State Copy**: Instead of generic "No data", use specific helpful text: "You haven't created any templates yet. Start with one of our professionally designed templates to launch your page in minutes."

**Error Messages**: Friendly, actionable language. Instead of "Invalid input", say "Please enter a valid email address like you@example.com". Include recovery steps when possible.

**Success Feedback**: Celebrate accomplishments with positive messaging. After first booking: "🎉 Congratulations! You received your first booking from [Client Name]". After publishing page: "Your page is now live at [subdomain].yourapp.com".

**Educational Content**: Help section organized by role (Getting Started, Managing Bookings, Growing Your Business). Each article includes "Related Articles" and "Was this helpful?" feedback buttons.

**Tooltips & Labels**: Descriptive labels reduce confusion. Instead of "Enable setting", use "Send 24-hour reminders to clients before sessions". Tooltips provide additional context without cluttering interface.

### Performance Optimizations for Professional Feel

**Skeleton Loading**: Show skeleton screens (gray animated boxes) matching content layout while data loads. Prevents jarring layout shifts and provides instant feedback.

**Optimistic UI Updates**: When trainer clicks "Publish", immediately show "Published" status while API request processes in background. Revert if error occurs. Makes interface feel instantaneous.

**Image Optimization**: Use Next.js Image component with automatic WebP conversion, lazy loading, and responsive sizes. Template preview images served from CDN with appropriate caching headers.

**Debounced Search**: Search inputs wait 300ms after typing stops before querying database. Prevents excessive API calls while maintaining responsive feel.

**Route Prefetching**: Next.js automatically prefetches linked pages on hover. When trainer hovers "Calendar" nav item, page loads in background for instant navigation.

This comprehensive documentation provides complete roadmap for building Trainerdesk with professional aesthetics, developer-friendly architecture, and maximum user value through thoughtful UX design and clear onboarding.
