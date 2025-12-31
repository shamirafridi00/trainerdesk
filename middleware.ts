import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  const subdomain = hostname?.split('.')[0];

  // Check if subdomain exists and is not main domain
  if (subdomain && subdomain !== 'www' && subdomain !== 'trainerdesk') {
    // Query database for trainer with this subdomain
    // Rewrite to dynamic route: /[subdomain]/page
    return NextResponse.rewrite(new URL(`/pages/${subdomain}`, request.url));
  }

  return NextResponse.next();
}
