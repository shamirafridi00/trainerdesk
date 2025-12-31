'use client';

import { Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { BookingList } from '@/components/dashboard/booking-list';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ErrorMessage } from '@/components/shared/error-message';
import { StatsCardSkeleton } from '@/components/dashboard/stats-card-skeleton';
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
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {greeting}, {firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here&apos;s what&apos;s happening with your training business today.
          </p>
        </div>

        {/* Stats Grid - Loading */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>

        {/* Content Grid - Loading */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex items-center justify-center p-12">
            <LoadingSpinner />
          </div>
          <div className="flex items-center justify-center p-12">
            <LoadingSpinner />
          </div>
        </div>
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
          Here&apos;s what&apos;s happening with your training business today.
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
