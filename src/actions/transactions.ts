'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { startOfJakartaDayUtc, endOfJakartaDayUtc } from '@/lib/jakarta-time'
import type {
    ActionResult,
    CreateTransactionInput,
    TransactionWithBooking,
    PaymentStatus,
    PaymentMethod
} from '@/types'
import { z } from 'zod'

const transactionSchema = z.object({
    bookingId: z.string().min(1, 'Booking wajib dipilih'),
    amount: z.number().min(1, 'Jumlah harus lebih dari 0'),
    paymentMethod: z.enum(['CASH', 'TRANSFER', 'EWALLET']),
    notes: z.string().optional(),
})

export async function getTransactions(filters?: {
    paymentStatus?: PaymentStatus
    dateFrom?: Date
    dateTo?: Date
}): Promise<TransactionWithBooking[]> {
    await requireAuth()

    const where: Record<string, unknown> = {}

    if (filters?.paymentStatus) {
        where.paymentStatus = filters.paymentStatus
    }

    if (filters?.dateFrom || filters?.dateTo) {
        where.createdAt = {}
        if (filters?.dateFrom) {
            (where.createdAt as Record<string, unknown>).gte = startOfJakartaDayUtc(filters.dateFrom)
        }
        if (filters?.dateTo) {
            (where.createdAt as Record<string, unknown>).lte = endOfJakartaDayUtc(filters.dateTo)
        }
    }

    return prisma.transaction.findMany({
        where,
        include: {
            booking: {
                include: {
                    field: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })
}

export async function getTransaction(id: string): Promise<TransactionWithBooking | null> {
    await requireAuth()

    return prisma.transaction.findUnique({
        where: { id },
        include: {
            booking: {
                include: {
                    field: true,
                },
            },
        },
    })
}

export async function createTransaction(
    _prevState: ActionResult<TransactionWithBooking> | null,
    formData: FormData
): Promise<ActionResult<TransactionWithBooking>> {
    try {
        await requireAuth()

        const rawData = {
            bookingId: formData.get('bookingId') as string,
            amount: parseInt(formData.get('amount') as string, 10),
            paymentMethod: formData.get('paymentMethod') as PaymentMethod,
            notes: (formData.get('notes') as string) || undefined,
        }

        const validatedFields = transactionSchema.safeParse(rawData)

        if (!validatedFields.success) {
            return {
                success: false,
                error: validatedFields.error.issues[0]?.message ?? 'Data tidak valid',
            }
        }

        const { bookingId, amount, paymentMethod, notes } = validatedFields.data

        // Check if booking exists and doesn't have a transaction
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { transaction: true },
        })

        if (!booking) {
            return { success: false, error: 'Booking tidak ditemukan' }
        }

        if (booking.transaction) {
            return { success: false, error: 'Booking sudah memiliki transaksi' }
        }

        if (booking.status === 'CANCELLED') {
            return { success: false, error: 'Tidak dapat membuat transaksi untuk booking yang dibatalkan' }
        }

        const transaction = await prisma.transaction.create({
            data: {
                bookingId,
                amount,
                paymentMethod,
                notes,
                paymentStatus: 'UNPAID',
            },
            include: {
                booking: {
                    include: {
                        field: true,
                    },
                },
            },
        })

        revalidatePath('/dashboard/transactions')
        revalidatePath('/dashboard/bookings')
        revalidatePath('/dashboard')

        return { success: true, data: transaction }
    } catch (error) {
        console.error('Error creating transaction:', error)
        return { success: false, error: 'Gagal membuat transaksi' }
    }
}

export async function markTransactionAsPaid(id: string): Promise<ActionResult<TransactionWithBooking>> {
    try {
        await requireAuth()

        const transaction = await prisma.transaction.findUnique({
            where: { id },
        })

        if (!transaction) {
            return { success: false, error: 'Transaksi tidak ditemukan' }
        }

        if (transaction.paymentStatus === 'PAID') {
            return { success: false, error: 'Transaksi sudah lunas' }
        }

        const updatedTransaction = await prisma.transaction.update({
            where: { id },
            data: {
                paymentStatus: 'PAID',
                paidAt: new Date(),
            },
            include: {
                booking: {
                    include: {
                        field: true,
                    },
                },
            },
        })

        revalidatePath('/dashboard/transactions')
        revalidatePath('/dashboard/reports')
        revalidatePath('/dashboard')

        return { success: true, data: updatedTransaction }
    } catch (error) {
        console.error('Error marking transaction as paid:', error)
        return { success: false, error: 'Gagal mengubah status pembayaran' }
    }
}

export async function getTodayIncome(): Promise<number> {
    await requireAuth()

    const today = new Date()

    const result = await prisma.transaction.aggregate({
        where: {
            paymentStatus: 'PAID',
            paidAt: {
                gte: startOfJakartaDayUtc(today),
                lte: endOfJakartaDayUtc(today),
            },
        },
        _sum: {
            amount: true,
        },
    })

    return result._sum.amount ?? 0
}
