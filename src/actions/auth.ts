'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createSession, deleteSession, verifyCredentials, hashPassword } from '@/lib/auth'
import type { ActionResult } from '@/types'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
})

export async function login(
    _prevState: ActionResult | null,
    formData: FormData
): Promise<ActionResult> {
    const rawData = {
        email: formData.get('email'),
        password: formData.get('password'),
    }

    const validatedFields = loginSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            success: false,
            error: validatedFields.error.issues[0]?.message ?? 'Data tidak valid',
        }
    }

    const { email, password } = validatedFields.data

    const user = await verifyCredentials(email, password)

    if (!user) {
        return {
            success: false,
            error: 'Email atau password salah',
        }
    }

    await createSession(user.id)
    redirect('/dashboard')
}

export async function logout(): Promise<void> {
    await deleteSession()
    redirect('/login')
}

// Create initial admin user (for seeding)
export async function createInitialAdmin(
    email: string,
    password: string,
    name: string
): Promise<ActionResult> {
    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        })

        if (existingUser) {
            return { success: false, error: 'User sudah ada' }
        }

        const hashedPassword = await hashPassword(password)

        await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                name,
                role: 'OWNER',
            },
        })

        return { success: true, data: undefined }
    } catch (error) {
        console.error('Error creating admin:', error)
        return { success: false, error: 'Gagal membuat user' }
    }
}
