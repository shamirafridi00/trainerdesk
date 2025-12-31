import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProfileSettingsSchema } from '@/lib/validations/settings';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { trainerId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.trainerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trainerId } = await params;

    // Ensure user can only update their own profile
    if (session.user.trainerId !== trainerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = ProfileSettingsSchema.parse(body);

    // Update trainer record
    const updatedTrainer = await prisma.trainer.update({
      where: { id: trainerId },
      data: {
        businessName: validatedData.businessName,
        bio: validatedData.bio || null,
        phone: validatedData.phone || null,
        timezone: validatedData.timezone,
        profilePhoto: validatedData.profilePhoto || null,
      },
    });

    // Update user name if changed
    if (validatedData.name !== session.user.name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: validatedData.name },
      });
    }

    return NextResponse.json({
      success: true,
      trainer: updatedTrainer,
    });
  } catch (error) {
    console.error('Update trainer error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { trainerId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.trainerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trainerId } = await params;

    // Ensure user can only view their own profile
    if (session.user.trainerId !== trainerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 });
    }

    return NextResponse.json(trainer);
  } catch (error) {
    console.error('Get trainer error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
