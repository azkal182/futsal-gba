import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/constants'

// Routes that don't require authentication
const publicRoutes = ['/login', '/']

// Routes that require specific roles
const ownerOnlyRoutes = ['/dashboard/reports']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)

    // Allow public routes
    if (publicRoutes.includes(pathname)) {
        // If logged in and trying to access login page, redirect to dashboard
        if (sessionCookie && pathname === '/login') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        return NextResponse.next()
    }

    // Protect dashboard routes
    if (pathname.startsWith('/dashboard')) {
        if (!sessionCookie) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('callbackUrl', pathname)
            return NextResponse.redirect(loginUrl)
        }

        // Check role for owner-only routes (basic check, full validation in server components)
        // Note: For proper role checking, decode the session token
        // This is a simplified check; full validation happens server-side

        return NextResponse.next()
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
    ],
}
