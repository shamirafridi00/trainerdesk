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
