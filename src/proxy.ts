import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protect API routes (except auth routes)
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip auth routes
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return NextResponse.next()
  }

  // Skip static files and share routes
  if (pathname.startsWith('/share') || pathname.startsWith('/_next') || pathname.startsWith('/logo')) {
    return NextResponse.next()
  }

  // API routes: check Authorization header
  if (pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // Page routes: let the client-side handle auth (redirect in page.tsx)
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.svg).*)'],
}
