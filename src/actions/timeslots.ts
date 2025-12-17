'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole } from '@/lib/auth'
import type { ActionResult } from '@/types'
import type { TimeSlot } from '@/generated/prisma/client'
import { z } from 'zod'

const timeSlotSchema = z.object({
    name: z.string().min(1, 'Nama kategori wajib diisi'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format waktu tidak valid (HH:MM)'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format waktu tidak valid (HH:MM)'),
    sortOrder: z.number().int().optional(),
})

/**
 * Get all time slots (public - for booking forms)
 */
export async function getTimeSlots(): Promise<TimeSlot[]> {
    return prisma.timeSlot.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
    })
}

/**
 * Get all time slots including inactive (admin only)
 */
export async function getAllTimeSlots(): Promise<TimeSlot[]> {
    await requireAuth()

    return prisma.timeSlot.findMany({
        orderBy: { sortOrder: 'asc' },
    })
}

/**
 * Create a new time slot category
 */
export async function createTimeSlot(
    _prevState: ActionResult<TimeSlot> | null,
    formData: FormData
): Promise<ActionResult<TimeSlot>> {
    try {
        await requireRole(['OWNER'])

        const rawData = {
            name: formData.get('name') as string,
            startTime: formData.get('startTime') as string,
            endTime: formData.get('endTime') as string,
            sortOrder: formData.get('sortOrder') ? parseInt(formData.get('sortOrder') as string) : undefined,
        }

        const validatedFields = timeSlotSchema.safeParse(rawData)

        if (!validatedFields.success) {
            return {
                success: false,
                error: validatedFields.error.issues[0]?.message ?? 'Data tidak valid',
            }
        }

        const { name, startTime, endTime, sortOrder } = validatedFields.data

        // Validate end time is after start time
        const [startHour, startMin] = startTime.split(':').map(Number)
        const [endHour, endMin] = endTime.split(':').map(Number)

        if (startHour * 60 + startMin >= endHour * 60 + endMin) {
            return { success: false, error: 'Jam selesai harus lebih besar dari jam mulai' }
        }

        // Get max sort order if not provided
        let order = sortOrder
        if (order === undefined) {
            const maxOrder = await prisma.timeSlot.aggregate({
                _max: { sortOrder: true },
            })
            order = (maxOrder._max.sortOrder ?? 0) + 1
        }

        const timeSlot = await prisma.timeSlot.create({
            data: {
                name,
                startTime,
                endTime,
                sortOrder: order,
            },
        })

        revalidatePath('/dashboard/settings/timeslots')
        revalidatePath('/book')
        revalidatePath('/schedule')

        return { success: true, data: timeSlot }
    } catch (error) {
        console.error('Error creating time slot:', error)
        return { success: false, error: 'Gagal membuat kategori waktu' }
    }
}

/**
 * Update a time slot category
 */
export async function updateTimeSlot(
    id: string,
    _prevState: ActionResult<TimeSlot> | null,
    formData: FormData
): Promise<ActionResult<TimeSlot>> {
    try {
        await requireRole(['OWNER'])

        const rawData = {
            name: formData.get('name') as string,
            startTime: formData.get('startTime') as string,
            endTime: formData.get('endTime') as string,
            sortOrder: formData.get('sortOrder') ? parseInt(formData.get('sortOrder') as string) : undefined,
        }

        const validatedFields = timeSlotSchema.safeParse(rawData)

        if (!validatedFields.success) {
            return {
                success: false,
                error: validatedFields.error.issues[0]?.message ?? 'Data tidak valid',
            }
        }

        const { name, startTime, endTime, sortOrder } = validatedFields.data

        // Validate end time is after start time
        const [startHour, startMin] = startTime.split(':').map(Number)
        const [endHour, endMin] = endTime.split(':').map(Number)

        if (startHour * 60 + startMin >= endHour * 60 + endMin) {
            return { success: false, error: 'Jam selesai harus lebih besar dari jam mulai' }
        }

        const timeSlot = await prisma.timeSlot.update({
            where: { id },
            data: {
                name,
                startTime,
                endTime,
                ...(sortOrder !== undefined && { sortOrder }),
            },
        })

        revalidatePath('/dashboard/settings/timeslots')
        revalidatePath('/book')
        revalidatePath('/schedule')

        return { success: true, data: timeSlot }
    } catch (error) {
        console.error('Error updating time slot:', error)
        return { success: false, error: 'Gagal mengubah kategori waktu' }
    }
}

/**
 * Toggle time slot active status
 */
export async function toggleTimeSlotStatus(id: string): Promise<ActionResult<TimeSlot>> {
    try {
        await requireRole(['OWNER'])

        const existing = await prisma.timeSlot.findUnique({
            where: { id },
        })

        if (!existing) {
            return { success: false, error: 'Kategori waktu tidak ditemukan' }
        }

        const timeSlot = await prisma.timeSlot.update({
            where: { id },
            data: { isActive: !existing.isActive },
        })

        revalidatePath('/dashboard/settings/timeslots')
        revalidatePath('/book')
        revalidatePath('/schedule')

        return { success: true, data: timeSlot }
    } catch (error) {
        console.error('Error toggling time slot status:', error)
        return { success: false, error: 'Gagal mengubah status kategori waktu' }
    }
}

/**
 * Delete a time slot category
 */
export async function deleteTimeSlot(id: string): Promise<ActionResult<null>> {
    try {
        await requireRole(['OWNER'])

        await prisma.timeSlot.delete({
            where: { id },
        })

        revalidatePath('/dashboard/settings/timeslots')
        revalidatePath('/book')
        revalidatePath('/schedule')

        return { success: true, data: null }
    } catch (error) {
        console.error('Error deleting time slot:', error)
        return { success: false, error: 'Gagal menghapus kategori waktu' }
    }
}
