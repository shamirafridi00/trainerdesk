import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Get the cookies
    const cookieStore = await cookies();

    // Clear all NextAuth cookies
    const cookiesToClear = [
      'authjs.session-token',
      'authjs.csrf-token',
      'authjs.callback-url',
      '__Secure-authjs.session-token', // For production HTTPS
      '__Secure-authjs.csrf-token',
      '__Secure-authjs.callback-url',
    ];

    cookiesToClear.forEach((cookieName) => {
      cookieStore.delete(cookieName);
    });

    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
