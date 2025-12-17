import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/constants'

// Public routes that don't require authentication
const publicRoutes = [
    '/',           // Public homepage
    '/login',      // Login page
    '/book',       // Public booking form
    '/schedule',   // Public schedule view
    '/confirmation', // Booking confirmation
]

// Check if pathname starts with any of the public routes
function isPublicRoute(pathname: string): boolean {
    return publicRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    )
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)

    // Allow public routes without authentication
    if (isPublicRoute(pathname)) {
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
         * - public folder files
         * - api routes
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
    ],
}
