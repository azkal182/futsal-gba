'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { validateStatusTransition } from '@/services/booking-state-machine'
import { TIME_SLOTS } from '@/lib/constants'
import type {
    ActionResult,
    CreateBookingInput,
    BookingFull,
    BookingStatus,
    TimeSlot
} from '@/types'
import { z } from 'zod'
import { startOfDay, endOfDay, format } from 'date-fns'

const bookingSchema = z.object({
    fieldId: z.string().min(1, 'Pilih lapangan'),
    customerName: z.string().min(1, 'Nama penyewa wajib diisi'),
    customerPhone: z.string().optional(),
    date: z.date(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format waktu tidak valid'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format waktu tidak valid'),
    notes: z.string().optional(),
})

function calculateDuration(startTime: string, endTime: string): number {
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)

    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    return Math.ceil((endMinutes - startMinutes) / 60)
}

export async function getBookings(filters?: {
    date?: Date
    fieldId?: string
    status?: BookingStatus
}): Promise<BookingFull[]> {
    await requireAuth()

    const where: Record<string, unknown> = {}

    if (filters?.date) {
        where.date = {
            gte: startOfDay(filters.date),
            lte: endOfDay(filters.date),
        }
    }

    if (filters?.fieldId) {
        where.fieldId = filters.fieldId
    }

    if (filters?.status) {
        where.status = filters.status
    }

    return prisma.booking.findMany({
        where,
        include: {
            field: true,
            transaction: true,
        },
        orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
    })
}

export async function getBooking(id: string): Promise<BookingFull | null> {
    await requireAuth()

    return prisma.booking.findUnique({
        where: { id },
        include: {
            field: true,
            transaction: true,
        },
    })
}

export async function getTodayBookings(): Promise<BookingFull[]> {
    await requireAuth()

    const today = new Date()

    return prisma.booking.findMany({
        where: {
            date: {
                gte: startOfDay(today),
                lte: endOfDay(today),
            },
        },
        include: {
            field: true,
            transaction: true,
        },
        orderBy: { startTime: 'asc' },
    })
}

export async function getAvailableSlots(
    fieldId: string,
    date: Date
): Promise<TimeSlot[]> {
    await requireAuth()

    // Get all bookings for this field on this date
    const bookings = await prisma.booking.findMany({
        where: {
            fieldId,
            date: {
                gte: startOfDay(date),
                lte: endOfDay(date),
            },
            status: {
                in: ['PENDING', 'CONFIRMED'],
            },
        },
        select: { startTime: true, endTime: true },
    })

    // Mark booked slots as unavailable
    const bookedSlots = new Set<string>()

    for (const booking of bookings) {
        const [startHour] = booking.startTime.split(':').map(Number)
        const [endHour] = booking.endTime.split(':').map(Number)

        for (let hour = startHour; hour < endHour; hour++) {
            bookedSlots.add(`${hour.toString().padStart(2, '0')}:00`)
        }
    }

    return TIME_SLOTS.map((time) => ({
        time,
        available: !bookedSlots.has(time),
    }))
}

export async function createBooking(
    _prevState: ActionResult<BookingFull> | null,
    formData: FormData
): Promise<ActionResult<BookingFull>> {
    try {
        await requireAuth()

        const rawData = {
            fieldId: formData.get('fieldId') as string,
            customerName: formData.get('customerName') as string,
            customerPhone: (formData.get('customerPhone') as string) || undefined,
            date: new Date(formData.get('date') as string),
            startTime: formData.get('startTime') as string,
            endTime: formData.get('endTime') as string,
            notes: (formData.get('notes') as string) || undefined,
        }

        const validatedFields = bookingSchema.safeParse(rawData)

        if (!validatedFields.success) {
            return {
                success: false,
                error: validatedFields.error.issues[0]?.message ?? 'Data tidak valid',
            }
        }

        const { fieldId, customerName, customerPhone, date, startTime, endTime, notes } = validatedFields.data

        // Get field for price calculation
        const field = await prisma.field.findUnique({
            where: { id: fieldId },
        })

        if (!field) {
            return { success: false, error: 'Lapangan tidak ditemukan' }
        }

        if (!field.isActive) {
            return { success: false, error: 'Lapangan tidak aktif' }
        }

        // Calculate duration and price
        const duration = calculateDuration(startTime, endTime)

        if (duration <= 0) {
            return { success: false, error: 'Waktu selesai harus lebih besar dari waktu mulai' }
        }

        const totalPrice = field.pricePerHour * duration

        // Use transaction to prevent race conditions (double booking)
        const booking = await prisma.$transaction(async (tx) => {
            // Check for overlapping bookings
            const existingBooking = await tx.booking.findFirst({
                where: {
                    fieldId,
                    date: {
                        gte: startOfDay(date),
                        lte: endOfDay(date),
                    },
                    status: {
                        in: ['PENDING', 'CONFIRMED'],
                    },
                    OR: [
                        // New booking starts during existing booking
                        {
                            startTime: { lte: startTime },
                            endTime: { gt: startTime },
                        },
                        // New booking ends during existing booking
                        {
                            startTime: { lt: endTime },
                            endTime: { gte: endTime },
                        },
                        // New booking contains existing booking
                        {
                            startTime: { gte: startTime },
                            endTime: { lte: endTime },
                        },
                    ],
                },
            })

            if (existingBooking) {
                throw new Error('Slot waktu sudah dibooking')
            }

            // Create booking
            return tx.booking.create({
                data: {
                    fieldId,
                    customerName,
                    customerPhone,
                    date: startOfDay(date),
                    startTime,
                    endTime,
                    duration,
                    totalPrice,
                    notes,
                    status: 'PENDING',
                },
                include: {
                    field: true,
                    transaction: true,
                },
            })
        })

        revalidatePath('/dashboard/bookings')
        revalidatePath('/dashboard')

        return { success: true, data: booking }
    } catch (error) {
        console.error('Error creating booking:', error)
        if (error instanceof Error) {
            return { success: false, error: error.message }
        }
        return { success: false, error: 'Gagal membuat booking' }
    }
}

export async function updateBookingStatus(
    id: string,
    newStatus: BookingStatus
): Promise<ActionResult<BookingFull>> {
    try {
        await requireAuth()

        const booking = await prisma.booking.findUnique({
            where: { id },
        })

        if (!booking) {
            return { success: false, error: 'Booking tidak ditemukan' }
        }

        // Validate status transition
        const validation = validateStatusTransition(booking.status, newStatus)

        if (!validation.valid) {
            return { success: false, error: validation.error! }
        }

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: { status: newStatus },
            include: {
                field: true,
                transaction: true,
            },
        })

        revalidatePath('/dashboard/bookings')
        revalidatePath('/dashboard')

        return { success: true, data: updatedBooking }
    } catch (error) {
        console.error('Error updating booking status:', error)
        return { success: false, error: 'Gagal mengubah status booking' }
    }
}

export async function getBookingStats() {
    await requireAuth()

    const today = new Date()

    const [
        todayBookingsCount,
        pendingCount,
        confirmedCount,
    ] = await Promise.all([
        prisma.booking.count({
            where: {
                date: {
                    gte: startOfDay(today),
                    lte: endOfDay(today),
                },
            },
        }),
        prisma.booking.count({
            where: { status: 'PENDING' },
        }),
        prisma.booking.count({
            where: { status: 'CONFIRMED' },
        }),
    ])

    return {
        todayBookings: todayBookingsCount,
        pendingBookings: pendingCount,
        confirmedBookings: confirmedCount,
    }
}
