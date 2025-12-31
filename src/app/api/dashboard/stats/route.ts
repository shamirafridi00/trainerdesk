import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth, subMonths } from 'date-fns';

export async function GET() {
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
