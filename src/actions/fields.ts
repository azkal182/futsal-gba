'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import type { ActionResult, CreateFieldInput, UpdateFieldInput, Field } from '@/types'
import { z } from 'zod'

const fieldSchema = z.object({
    name: z.string().min(1, 'Nama lapangan wajib diisi'),
    description: z.string().optional(),
    pricePerHour: z.number().min(1, 'Harga harus lebih dari 0'),
    isActive: z.boolean().optional().default(true),
})

export async function getFields(): Promise<Field[]> {
    await requireAuth()

    return prisma.field.findMany({
        orderBy: { name: 'asc' },
    })
}

export async function getActiveFields(): Promise<Field[]> {
    await requireAuth()

    return prisma.field.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
    })
}

export async function getField(id: string): Promise<Field | null> {
    await requireAuth()

    return prisma.field.findUnique({
        where: { id },
    })
}

export async function createField(
    _prevState: ActionResult<Field> | null,
    formData: FormData
): Promise<ActionResult<Field>> {
    try {
        await requireAuth()

        const rawData = {
            name: formData.get('name') as string,
            description: (formData.get('description') as string) || undefined,
            pricePerHour: parseInt(formData.get('pricePerHour') as string, 10),
            isActive: formData.get('isActive') === 'true',
        }

        const validatedFields = fieldSchema.safeParse(rawData)

        if (!validatedFields.success) {
            return {
                success: false,
                error: validatedFields.error.issues[0]?.message ?? 'Data tidak valid',
            }
        }

        const field = await prisma.field.create({
            data: validatedFields.data,
        })

        revalidatePath('/dashboard/fields')

        return { success: true, data: field }
    } catch (error) {
        console.error('Error creating field:', error)
        return { success: false, error: 'Gagal membuat lapangan' }
    }
}

export async function updateField(
    id: string,
    data: UpdateFieldInput
): Promise<ActionResult<Field>> {
    try {
        await requireAuth()

        const field = await prisma.field.update({
            where: { id },
            data,
        })

        revalidatePath('/dashboard/fields')

        return { success: true, data: field }
    } catch (error) {
        console.error('Error updating field:', error)
        return { success: false, error: 'Gagal mengupdate lapangan' }
    }
}

export async function toggleFieldStatus(id: string): Promise<ActionResult<Field>> {
    try {
        await requireAuth()

        const field = await prisma.field.findUnique({
            where: { id },
        })

        if (!field) {
            return { success: false, error: 'Lapangan tidak ditemukan' }
        }

        const updatedField = await prisma.field.update({
            where: { id },
            data: { isActive: !field.isActive },
        })

        revalidatePath('/dashboard/fields')

        return { success: true, data: updatedField }
    } catch (error) {
        console.error('Error toggling field status:', error)
        return { success: false, error: 'Gagal mengubah status lapangan' }
    }
}

export async function deleteField(id: string): Promise<ActionResult> {
    try {
        await requireAuth()

        // Check if field has bookings
        const bookingsCount = await prisma.booking.count({
            where: { fieldId: id },
        })

        if (bookingsCount > 0) {
            return {
                success: false,
                error: 'Tidak dapat menghapus lapangan yang memiliki booking. Nonaktifkan saja.'
            }
        }

        await prisma.field.delete({
            where: { id },
        })

        revalidatePath('/dashboard/fields')

        return { success: true, data: undefined }
    } catch (error) {
        console.error('Error deleting field:', error)
        return { success: false, error: 'Gagal menghapus lapangan' }
    }
}
