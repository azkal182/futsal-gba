'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import type { ActionResult, Expense, CreateExpenseInput } from '@/types'
import { z } from 'zod'
import { startOfDay, endOfDay } from 'date-fns'

const expenseSchema = z.object({
    date: z.date(),
    amount: z.number().min(1, 'Jumlah harus lebih dari 0'),
    description: z.string().min(1, 'Deskripsi wajib diisi'),
    category: z.string().optional(),
})

export async function getExpenses(filters?: {
    dateFrom?: Date
    dateTo?: Date
    category?: string
}): Promise<Expense[]> {
    await requireAuth()

    const where: Record<string, unknown> = {}

    if (filters?.dateFrom || filters?.dateTo) {
        where.date = {}
        if (filters?.dateFrom) {
            (where.date as Record<string, unknown>).gte = startOfDay(filters.dateFrom)
        }
        if (filters?.dateTo) {
            (where.date as Record<string, unknown>).lte = endOfDay(filters.dateTo)
        }
    }

    if (filters?.category) {
        where.category = filters.category
    }

    return prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
    })
}

export async function getExpense(id: string): Promise<Expense | null> {
    await requireAuth()

    return prisma.expense.findUnique({
        where: { id },
    })
}

export async function createExpense(
    _prevState: ActionResult<Expense> | null,
    formData: FormData
): Promise<ActionResult<Expense>> {
    try {
        await requireAuth()

        const rawData = {
            date: new Date(formData.get('date') as string),
            amount: parseInt(formData.get('amount') as string, 10),
            description: formData.get('description') as string,
            category: (formData.get('category') as string) || undefined,
        }

        const validatedFields = expenseSchema.safeParse(rawData)

        if (!validatedFields.success) {
            return {
                success: false,
                error: validatedFields.error.issues[0]?.message ?? 'Data tidak valid',
            }
        }

        const expense = await prisma.expense.create({
            data: {
                ...validatedFields.data,
                date: startOfDay(validatedFields.data.date),
            },
        })

        revalidatePath('/dashboard/expenses')
        revalidatePath('/dashboard/reports')
        revalidatePath('/dashboard')

        return { success: true, data: expense }
    } catch (error) {
        console.error('Error creating expense:', error)
        return { success: false, error: 'Gagal membuat pengeluaran' }
    }
}

export async function updateExpense(
    id: string,
    data: Partial<CreateExpenseInput>
): Promise<ActionResult<Expense>> {
    try {
        await requireAuth()

        const updateData: Record<string, unknown> = { ...data }
        if (data.date) {
            updateData.date = startOfDay(data.date)
        }

        const expense = await prisma.expense.update({
            where: { id },
            data: updateData,
        })

        revalidatePath('/dashboard/expenses')
        revalidatePath('/dashboard/reports')

        return { success: true, data: expense }
    } catch (error) {
        console.error('Error updating expense:', error)
        return { success: false, error: 'Gagal mengupdate pengeluaran' }
    }
}

export async function deleteExpense(id: string): Promise<ActionResult> {
    try {
        await requireAuth()

        await prisma.expense.delete({
            where: { id },
        })

        revalidatePath('/dashboard/expenses')
        revalidatePath('/dashboard/reports')

        return { success: true, data: undefined }
    } catch (error) {
        console.error('Error deleting expense:', error)
        return { success: false, error: 'Gagal menghapus pengeluaran' }
    }
}

export async function getExpenseCategories(): Promise<string[]> {
    await requireAuth()

    const expenses = await prisma.expense.findMany({
        where: { category: { not: null } },
        select: { category: true },
        distinct: ['category'],
    })

    return expenses
        .map((e) => e.category)
        .filter((c): c is string => c !== null)
}

export async function getTotalExpenses(dateFrom: Date, dateTo: Date): Promise<number> {
    await requireAuth()

    const result = await prisma.expense.aggregate({
        where: {
            date: {
                gte: startOfDay(dateFrom),
                lte: endOfDay(dateTo),
            },
        },
        _sum: {
            amount: true,
        },
    })

    return result._sum.amount ?? 0
}
