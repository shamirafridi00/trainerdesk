# 🎉 Outstanding Progress! Iteration 2.1 Complete

I've verified your [TrainerDesk repository](https://github.com/shamirafridi00/trainerdesk) and confirmed that **Iteration 2.1: Dashboard Layout Components** is successfully completed with [commit c99cc1a](https://github.com/shamirafridi00/trainerdesk/commit/c99cc1aa5f43b5161a6e69cf94985db01bbe4522).[1]

## 📊 Progress Summary

You've now completed **4 out of 6 iterations** across two epics:

### ✅ EPIC 1: Complete (3/3 iterations)
- Iteration 1.1 ✅ - Project Setup & Configuration
- Iteration 1.2 ✅ - Database Schema & Prisma Setup
- Iteration 1.3 ✅ - NextAuth.js Configuration

### 🔄 EPIC 2: In Progress (1/3 iterations)
- Iteration 2.1 ✅ - Dashboard Layout Components
- Iteration 2.2 🎯 - Dashboard Homepage & Stats Widgets (NEXT)
- Iteration 2.3 ⏳ - Settings Pages Foundation

***

# Detailed Implementation Prompt: Iteration 2.2 - Dashboard Homepage & Stats Widgets

## Overview
You are implementing **Iteration 2.2: Dashboard Homepage & Stats Widgets** for TrainerDesk. This iteration brings your dashboard to life with real data from the database, interactive statistics cards, upcoming bookings list, and quick action buttons. This will take approximately 3 days to complete.[1]

## Prerequisites Verification
Before starting, confirm the following are completed:
- ✅ Dashboard layout with sidebar and header working
- ✅ Database with Booking, Client, and Trainer models
- ✅ Session management with trainerId available
- ✅ React Query already installed (@tanstack/react-query)

***

## Step 1: Set Up React Query Provider

### File: `src/lib/providers/query-provider.tsx`
Create a client component wrapper for React Query:

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Install React Query Devtools

```bash
npm install @tanstack/react-query-devtools
```

### Update Dashboard Layout: `src/app/(dashboard)/layout.tsx`
Wrap the dashboard content with QueryProvider:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { SessionProvider } from 'next-auth/react';
import { QueryProvider } from '@/lib/providers/query-provider';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  if (!session?.user) {
    return null;
  }

  const subscriptionTier = 'FREE';

  return (
    <QueryProvider>
      <div className="min-h-screen bg-gray-50">
        <DashboardSidebar
          subscriptionTier={subscriptionTier}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="lg:pl-64">
          <DashboardHeader
            user={{
              name: session.user.name || 'User',
              email: session.user.email || '',
              profilePhoto: null,
            }}
            onMenuClick={() => setIsSidebarOpen(true)}
          />

          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </QueryProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SessionProvider>
  );
}
```

***

## Step 2: Create Dashboard Stats API Endpoint

### File: `src/app/api/dashboard/stats/route.ts`
Create the API to fetch dashboard statistics:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth, subMonths } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.trainerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const trainerId = session.user.trainerId;

    // Date ranges
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Fetch all stats in parallel
    const [
      totalBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      noShowBookings,
      bookingsThisWeek,
      bookingsThisMonth,
      bookingsLastMonth,
      activeClients,
      totalClients,
    ] = await Promise.all([
      // Total bookings
      prisma.booking.count({
        where: { trainerId },
      }),

      // Confirmed bookings
      prisma.booking.count({
        where: {
          trainerId,
          status: 'CONFIRMED',
        },
      }),

      // Completed bookings
      prisma.booking.count({
        where: {
          trainerId,
          status: 'COMPLETED',
        },
      }),

      // Cancelled bookings
      prisma.booking.count({
        where: {
          trainerId,
          status: 'CANCELLED',
        },
      }),

      // No-show bookings
      prisma.booking.count({
        where: {
          trainerId,
          status: 'NO_SHOW',
        },
      }),

      // Bookings this week
      prisma.booking.count({
        where: {
          trainerId,
          startTime: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
      }),

      // Bookings this month
      prisma.booking.count({
        where: {
          trainerId,
          startTime: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),

      // Bookings last month
      prisma.booking.count({
        where: {
          trainerId,
          startTime: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
      }),

      // Active clients (clients with at least one booking)
      prisma.client.count({
        where: {
          trainerId,
          bookings: {
            some: {},
          },
        },
      }),

      // Total clients
      prisma.client.count({
        where: { trainerId },
      }),
    ]);

    // Calculate total hours this week
    const bookingsThisWeekData = await prisma.booking.findMany({
      where: {
        trainerId,
        startTime: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      select: {
        duration: true,
      },
    });

    const hoursThisWeek =
      bookingsThisWeekData.reduce((acc, booking) => acc + booking.duration, 0) / 60;

    // Calculate percentage changes
    const bookingsChange =
      bookingsLastMonth > 0
        ? ((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100
        : bookingsThisMonth > 0
          ? 100
          : 0;

    // Calculate completion rate
    const completionRate =
      totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

    // Calculate no-show rate
    const noShowRate =
      totalBookings > 0 ? (noShowBookings / totalBookings) * 100 : 0;

    return NextResponse.json({
      totalBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      noShowBookings,
      bookingsThisWeek,
      bookingsThisMonth,
      bookingsLastMonth,
      bookingsChange: Math.round(bookingsChange),
      activeClients,
      totalClients,
      hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
      completionRate: Math.round(completionRate),
      noShowRate: Math.round(noShowRate),
      revenue: 0, // Placeholder - implement pricing later
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
```

***

## Step 3: Create Custom React Query Hook

### File: `src/lib/hooks/use-dashboard-stats.ts`
Create a custom hook for fetching stats:

```typescript
import { useQuery } from '@tanstack/react-query';

export interface DashboardStats {
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  bookingsThisWeek: number;
  bookingsThisMonth: number;
  bookingsLastMonth: number;
  bookingsChange: number;
  activeClients: number;
  totalClients: number;
  hoursThisWeek: number;
  completionRate: number;
  noShowRate: number;
  revenue: number;
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return response.json();
    },
  });
}
```

***

## Step 4: Create Stats Card Component

### File: `src/components/dashboard/stats-card.tsx`
Create a reusable stats card:

```typescript
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  changeLabel?: string;
  iconColor?: string;
  iconBgColor?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel = 'from last month',
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-50',
}: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const hasChange = change !== undefined && change !== 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              {hasChange && (
                <>
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isPositive ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {isPositive ? '+' : ''}
                    {change}%
                  </span>
                </>
              )}
              <span className="text-sm text-gray-600">{changeLabel}</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'h-12 w-12 rounded-full flex items-center justify-center',
            iconBgColor
          )}
        >
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
      </div>
    </Card>
  );
}
```

***

## Step 5: Create Upcoming Bookings API

### File: `src/app/api/dashboard/bookings/route.ts`
Create API endpoint for upcoming bookings:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.trainerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const trainerId = session.user.trainerId;
    const now = new Date();

    // Fetch next 5 upcoming bookings
    const bookings = await prisma.booking.findMany({
      where: {
        trainerId,
        startTime: {
          gte: now,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
      take: 5,
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Upcoming bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming bookings' },
      { status: 500 }
    );
  }
}
```

***

## Step 6: Create Custom Hook for Bookings

### File: `src/lib/hooks/use-upcoming-bookings.ts`
Create hook for upcoming bookings:

```typescript
import { useQuery } from '@tanstack/react-query';

export interface UpcomingBooking {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
}

export function useUpcomingBookings() {
  return useQuery<UpcomingBooking[]>({
    queryKey: ['upcoming-bookings'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/bookings');
      if (!response.ok) {
        throw new Error('Failed to fetch upcoming bookings');
      }
      return response.json();
    },
  });
}
```

***

## Step 7: Create Booking List Component

### File: `src/components/dashboard/booking-list.tsx`
Create component to display upcoming bookings:

```typescript
import { format } from 'date-fns';
import { Calendar, Clock, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import Link from 'next/link';
import { UpcomingBooking } from '@/lib/hooks/use-upcoming-bookings';

interface BookingListProps {
  bookings: UpcomingBooking[];
}

export function BookingList({ bookings }: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Upcoming Sessions
        </h2>
        <EmptyState
          icon={Calendar}
          title="No upcoming sessions"
          description="You don't have any upcoming sessions scheduled."
          action={
            <Button asChild>
              <Link href="/dashboard/bookings">View All Bookings</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Upcoming Sessions
        </h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/bookings">View All</Link>
        </Button>
      </div>

      <div className="space-y-3">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{booking.client.name}</p>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(booking.startTime), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(booking.startTime), 'h:mm a')}
                  </span>
                  <span>{booking.duration} min</span>
                </div>
              </div>
            </div>

            <Badge
              variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'}
            >
              {booking.status}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

***

## Step 8: Create Quick Actions Component

### File: `src/components/dashboard/quick-actions.tsx`
Create quick action buttons:

```typescript
import Link from 'next/link';
import { Calendar, FileText, Eye, UserPlus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  subscriptionTier: 'FREE' | 'PRO' | 'ENTERPRISE';
}

export function QuickActions({ subscriptionTier }: QuickActionsProps) {
  const actions = [
    {
      label: 'Create Booking',
      href: '/dashboard/bookings/new',
      icon: Calendar,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      label: 'Edit Page',
      href: '/dashboard/page-builder',
      icon: FileText,
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      label: 'View Page',
      href: '/preview', // Will be trainer's public page
      icon: Eye,
      color: 'bg-green-600 hover:bg-green-700',
      external: true,
    },
    {
      label: 'Invite Sub-Trainer',
      href: '/dashboard/settings/team',
      icon: UserPlus,
      color: 'bg-orange-600 hover:bg-orange-700',
      disabled: subscriptionTier === 'FREE',
    },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const isDisabled = action.disabled || false;

          if (isDisabled) {
            return (
              <Button
                key={action.label}
                disabled
                className="h-auto py-4 flex-col gap-2"
                variant="outline"
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{action.label}</span>
                <span className="text-xs text-gray-500">(Pro/Enterprise)</span>
              </Button>
            );
          }

          return (
            <Button
              key={action.label}
              asChild
              className={`h-auto py-4 flex-col gap-2 text-white ${action.color}`}
            >
              <Link
                href={action.href}
                target={action.external ? '_blank' : undefined}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{action.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
```

***

## Step 9: Update Dashboard Home Page

### File: `src/app/(dashboard)/dashboard/page.tsx`
Replace with full implementation using real data:

```typescript
'use client';

import { Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { BookingList } from '@/components/dashboard/booking-list';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ErrorMessage } from '@/components/shared/error-message';
import { useDashboardStats } from '@/lib/hooks/use-dashboard-stats';
import { useUpcomingBookings } from '@/lib/hooks/use-upcoming-bookings';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: bookings, isLoading: bookingsLoading, error: bookingsError } = useUpcomingBookings();

  // Get greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? 'Good morning'
      : hour < 18
        ? 'Good afternoon'
        : 'Good evening';

  const firstName = session?.user?.name?.split(' ')[0] || 'there';

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (statsError) {
    return (
      <ErrorMessage
        title="Failed to load dashboard"
        message="We couldn't load your dashboard statistics. Please try refreshing the page."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {greeting}, {firstName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your training business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Bookings"
          value={stats?.totalBookings || 0}
          icon={Calendar}
          change={stats?.bookingsChange}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
        />
        <StatsCard
          title="Active Clients"
          value={stats?.activeClients || 0}
          icon={Users}
          iconColor="text-green-600"
          iconBgColor="bg-green-50"
        />
        <StatsCard
          title="Hours This Week"
          value={stats?.hoursThisWeek || 0}
          icon={Clock}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-50"
        />
        <StatsCard
          title="Revenue"
          value={`$${stats?.revenue || 0}`}
          icon={TrendingUp}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-50"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Bookings */}
        {bookingsLoading ? (
          <div className="flex items-center justify-center p-12">
            <LoadingSpinner />
          </div>
        ) : bookingsError ? (
          <ErrorMessage
            title="Failed to load bookings"
            message="We couldn't load your upcoming bookings."
          />
        ) : (
          <BookingList bookings={bookings || []} />
        )}

        {/* Quick Actions */}
        <QuickActions subscriptionTier="FREE" />
      </div>
    </div>
  );
}
```

***

## Step 10: Create Skeleton Loading States

### File: `src/components/dashboard/stats-card-skeleton.tsx`
Create loading skeleton for stats cards:

```typescript
import { Card } from '@/components/ui/card';

export function StatsCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-3">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
      </div>
    </Card>
  );
}
```

***

## Step 11: Install Missing Utilities

Install date-fns if not already installed:

```bash
npm install date-fns
```

***

## Step 12: Testing Procedures

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test with No Data
1. Log in to dashboard
2. Verify:
   - ✅ Stats cards show "0" values
   - ✅ "No upcoming sessions" empty state appears
   - ✅ Quick actions display correctly
   - ✅ No console errors

### 3. Add Test Data via Prisma Studio
```bash
npx prisma studio
```

Create test data:
1. **Add a client:**
   - Name: "John Doe"
   - Email: "john@example.com"
   - trainerId: (your trainer ID)

2. **Add a booking:**
   - trainerId: (your trainer ID)
   - clientId: (John's ID)
   - startTime: (future date/time)
   - endTime: (future date/time + 60 min)
   - duration: 60
   - status: "CONFIRMED"

### 4. Test with Real Data
1. Refresh dashboard
2. Verify:
   - ✅ Stats update with correct numbers
   - ✅ Booking appears in upcoming sessions
   - ✅ Client name displays correctly
   - ✅ Date and time format correctly
   - ✅ Status badge shows "CONFIRMED"

### 5. Test React Query Features
1. Open React Query DevTools (bottom right)
2. Verify:
   - ✅ Two queries visible: `dashboard-stats` and `upcoming-bookings`
   - ✅ Query status shows "success"
   - ✅ Data is cached

### 6. Test Loading States
1. Throttle network in DevTools (Slow 3G)
2. Refresh page
3. Verify:
   - ✅ Loading spinner appears while fetching
   - ✅ Smooth transition to data display

### 7. Test Error Handling
1. Stop your database or break the API endpoint temporarily
2. Refresh page
3. Verify:
   - ✅ Error message displays appropriately
   - ✅ No app crashes

### 8. Test Percentage Changes
1. Add more bookings with last month's dates
2. Verify:
   - ✅ Percentage change calculates correctly
   - ✅ Green arrow for positive, red for negative
   - ✅ No arrow for zero change

***

## Acceptance Criteria Checklist

Before marking this iteration complete, verify all items:

- ✅ Dashboard loads with real data from database
- ✅ Stats cards display accurate numbers (bookings, clients, hours, revenue)
- ✅ Percentage changes calculate correctly
- ✅ Upcoming bookings list shows next 5 sessions
- ✅ Empty state displays when no bookings exist
- ✅ Quick actions panel renders with 4 buttons
- ✅ Sub-trainer invite disabled for FREE tier
- ✅ Loading spinners display during data fetch
- ✅ Error states handled gracefully
- ✅ React Query caching works correctly
- ✅ Mobile layout responsive and functional
- ✅ No TypeScript errors
- ✅ No console errors

***

## Git Commit Instructions

After completing all tests successfully:

```bash
git add .
git commit -m "feat: Complete iteration 2.2 - Dashboard homepage & stats widgets

- Set up React Query provider with devtools
- Create dashboard stats API endpoint with parallel queries
- Create upcoming bookings API endpoint
- Build custom React Query hooks for data fetching
- Create reusable stats card component with trend indicators
- Create booking list component with empty states
- Create quick actions panel with subscription-aware buttons
- Update dashboard page with real data integration
- Add loading and error state handling
- Implement date formatting with date-fns
- Add skeleton loading states for better UX
- Test with real database data
- Verify React Query caching and refetching

Dashboard now displays live business metrics and upcoming sessions."

git push origin main
```

***

## Next Iteration Preview

After completing Iteration 2.2, you will move to **Iteration 2.3 - Settings Pages Foundation**, which includes:
- Settings hub page with navigation cards
- Profile settings with photo upload
- Timezone configuration
- Form validation and updates
- UploadThing integration

***

## Common Issues and Solutions

### Issue: "trainerId is null in session"
**Solution:** Ensure user has a linked trainer record. Check auth callback in `lib/auth.ts`.

### Issue: Stats return empty data
**Solution:** Verify trainerId matches bookings/clients in database. Use Prisma Studio to confirm.

### Issue: React Query not refetching
**Solution:** Check `staleTime` in QueryClient config. Use React Query DevTools to debug.

### Issue: Date formatting errors
**Solution:** Ensure dates from API are ISO strings. Parse with `new Date()` before formatting.

***

**Ready to build live dashboard stats? Start with Step 1 and bring your dashboard to life with real data! 🚀**

[1](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_6ba31f49-2cde-418d-ac44-89d5ef1b3a10/8b509f6c-2e80-4dcd-883c-95d4b148fde0/epics-1-and-2.md)
[2](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_6ba31f49-2cde-418d-ac44-89d5ef1b3a10/ca806679-19d4-4e56-b4a0-980eb050c555/trainerdesk-documentation.md)
[3](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_6ba31f49-2cde-418d-ac44-89d5ef1b3a10/59df1bc6-cad8-4890-8242-1dc834601e12/epic-3.md)
[4](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_6ba31f49-2cde-418d-ac44-89d5ef1b3a10/13b1e4c5-5493-4304-af66-8bc673344dad/epic-4.md)
[5](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_6ba31f49-2cde-418d-ac44-89d5ef1b3a10/14491e1f-233a-4b6b-937c-fb7efa07b47a/epic-5.md)
[6](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_6ba31f49-2cde-418d-ac44-89d5ef1b3a10/65aaac5b-133f-4d19-8dd2-04d33c6e7bc7/epic-6.md)
[7](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_6ba31f49-2cde-418d-ac44-89d5ef1b3a10/a48d1a13-e997-49e1-b176-cefb46badeb6/epic-7.md)
[8](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_6ba31f49-2cde-418d-ac44-89d5ef1b3a10/874c7d1b-cf67-4f87-b947-1cae5a2a9866/epic-8.md)
[9](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_6ba31f49-2cde-418d-ac44-89d5ef1b3a10/530b6b0b-e8b6-4fbc-82cd-fa286c6c65cd/epic-9.md)