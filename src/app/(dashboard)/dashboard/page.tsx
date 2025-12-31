import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const stats = [
    {
      name: 'Total Bookings',
      value: '0',
      icon: Calendar,
      change: '+0%',
      changeType: 'positive' as const,
    },
    {
      name: 'Active Clients',
      value: '0',
      icon: Users,
      change: '+0%',
      changeType: 'positive' as const,
    },
    {
      name: 'Hours This Week',
      value: '0',
      icon: Clock,
      change: '+0%',
      changeType: 'positive' as const,
    },
    {
      name: 'Revenue',
      value: '$0',
      icon: TrendingUp,
      change: '+0%',
      changeType: 'positive' as const,
    },
  ];

  // Get greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? 'Good morning'
      : hour < 18
        ? 'Good afternoon'
        : 'Good evening';

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {greeting}, {session.user.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your training business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span
                      className={
                        stat.changeType === 'positive'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {stat.change}
                    </span>{' '}
                    from last month
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Placeholder Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming Sessions
          </h2>
          <p className="text-sm text-gray-600">
            No upcoming sessions scheduled. Sessions will appear here once you start accepting bookings.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <p className="text-sm text-gray-600">
            Quick action buttons will be added in the next iteration.
          </p>
        </Card>
      </div>
    </div>
  );
}
