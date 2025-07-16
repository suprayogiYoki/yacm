// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/shared/jwt'
import { cookies } from 'next/headers'

const needLogin = ['/add', '/edit', '/table', '/view']
export async function middleware(req: NextRequest) {
  const token = (await cookies()).get('token')?.value
  const pathname = req.nextUrl.pathname
  const headers = new Headers(req.headers)
  headers.set('x-pathname', pathname)
  // console.log('verify', token);

  let reject = false;
  // jika tidak butuh login langsung
  for (const check of needLogin) {
    if (req.nextUrl.pathname.startsWith(check) === true) {
      console.log(req.nextUrl.pathname)
      reject = true;
    }
  }

  if (reject === true) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  else {
    return NextResponse.next({ request: { headers } })
  }

}