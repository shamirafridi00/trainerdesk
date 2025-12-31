import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
