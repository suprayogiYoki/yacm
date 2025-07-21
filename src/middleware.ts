// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { fetcher } from '@/lib/fetcher'

const needLogin = ['/add', '/edit', '/table', '/view', '/profile', '/tenant']
const nonLoginOnly = ['/login', '/register']

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  const { payload } = token ? await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET)) : { payload: null };
  const pathname = req.nextUrl.pathname
  const headers = new Headers(req.headers)
  headers.set('x-pathname', pathname)



  let reject = false;
  // check path yang butuh login
  if (!payload) {
    if (pathname === '/' || pathname === '') {
      reject = true;
    }
    for (const check of needLogin) {
      if (req.nextUrl.pathname.startsWith(check) === true) {
        reject = true;
      }
    }
  }
  else {
    // const requestHeaders = new Headers(req.headers);
    // requestHeaders.set('x-user', JSON.stringify(payload));
    // hanya non login
    for (const check of nonLoginOnly) {
      if (req.nextUrl.pathname.startsWith(check) === true) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    // if (
    //   pathname !== '/api/auth/refresh'
    // ) {
    //   fetcher({
    //     path: '/auth/refresh',
    //     method: 'GET',
    //   }
    //   );
    // }
  }

  if (reject === true) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  else {
    return NextResponse.next({ request: { headers } })
  }

}