
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware is now a pass-through and does not perform authentication.
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

// The matcher is removed to completely disable the middleware.
export const config = {
  matcher: [],
};
