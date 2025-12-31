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
