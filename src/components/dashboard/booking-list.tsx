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
