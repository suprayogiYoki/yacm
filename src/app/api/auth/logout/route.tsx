// app/logout/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  // Delete the cookie
  (await cookies()).delete('token');

  // Redirect to login
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_WEB_ADDRESS));
}
