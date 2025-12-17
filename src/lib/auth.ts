import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { SESSION_COOKIE_NAME, SESSION_DURATION_DAYS } from './constants'
import type { Session, SessionUser } from '@/types'
import bcrypt from 'bcryptjs'

// Simple session encoding (in production, use JWT or encrypted sessions)
function encodeSession(user: SessionUser, expiresAt: Date): string {
    const session: Session = { user, expiresAt }
    return Buffer.from(JSON.stringify(session)).toString('base64')
}

function decodeSession(token: string): Session | null {
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8')
        const session = JSON.parse(decoded) as Session
        session.expiresAt = new Date(session.expiresAt)
        return session
    } catch {
        return null
    }
}

export async function createSession(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true },
    })

    if (!user) {
        throw new Error('User not found')
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS)

    const sessionToken = encodeSession(user, expiresAt)

    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
    })
}

export async function getSession(): Promise<Session | null> {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

    if (!sessionCookie?.value) {
        return null
    }

    const session = decodeSession(sessionCookie.value)

    if (!session) {
        return null
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
        await deleteSession()
        return null
    }

    return session
}

export async function deleteSession(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getCurrentUser(): Promise<SessionUser | null> {
    const session = await getSession()
    return session?.user ?? null
}

export async function requireAuth(): Promise<SessionUser> {
    const user = await getCurrentUser()
    if (!user) {
        throw new Error('Unauthorized')
    }
    return user
}

export async function requireRole(allowedRoles: string[]): Promise<SessionUser> {
    const user = await requireAuth()
    if (!allowedRoles.includes(user.role)) {
        throw new Error('Forbidden')
    }
    return user
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
}

// Verify user credentials
export async function verifyCredentials(email: string, password: string) {
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    })

    if (!user) {
        return null
    }

    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
        return null
    }

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    }
}
