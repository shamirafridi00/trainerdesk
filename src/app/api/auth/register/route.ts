import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { generateUniqueSubdomain } from '@/lib/utils/subdomain';
import { RegisterSchema } from '@/lib/validations/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = RegisterSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, email, businessName, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Generate unique subdomain
    const subdomain = await generateUniqueSubdomain(businessName);

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user and trainer in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create trainer first
      const trainer = await tx.trainer.create({
        data: {
          businessName,
          subdomain,
          subscriptionTier: 'FREE',
          smsCredits: 10,
          emailCredits: 50,
        },
      });

      // Create user linked to trainer
      const user = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: 'PRIMARY_TRAINER',
          trainerId: trainer.id,
        },
      });

      return { user, trainer };
    });

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
        trainer: {
          id: result.trainer.id,
          subdomain: result.trainer.subdomain,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
