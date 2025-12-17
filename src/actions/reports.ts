'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole } from '@/lib/auth'
import type { FinancialSummary, DateRange } from '@/types'
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'

export async function getFinancialSummary(dateRange: DateRange): Promise<FinancialSummary> {
    await requireAuth()

    const { from, to } = dateRange

    // Get total income from PAID transactions
    const incomeResult = await prisma.transaction.aggregate({
        where: {
            paymentStatus: 'PAID',
            paidAt: {
                gte: startOfDay(from),
                lte: endOfDay(to),
            },
        },
        _sum: {
            amount: true,
        },
        _count: true,
    })

    // Get total expenses
    const expenseResult = await prisma.expense.aggregate({
        where: {
            date: {
                gte: startOfDay(from),
                lte: endOfDay(to),
            },
        },
        _sum: {
            amount: true,
        },
    })

    const totalIncome = incomeResult._sum.amount ?? 0
    const totalExpense = expenseResult._sum.amount ?? 0

    return {
        totalIncome,
        totalExpense,
        profit: totalIncome - totalExpense,
        transactionCount: incomeResult._count,
    }
}

export async function getDailyIncome(dateRange: DateRange): Promise<{ date: string; amount: number }[]> {
    await requireAuth()

    const { from, to } = dateRange

    const transactions = await prisma.transaction.findMany({
        where: {
            paymentStatus: 'PAID',
            paidAt: {
                gte: startOfDay(from),
                lte: endOfDay(to),
            },
        },
        select: {
            amount: true,
            paidAt: true,
        },
    })

    // Group by date
    const dailyMap = new Map<string, number>()

    for (const tx of transactions) {
        if (tx.paidAt) {
            const dateKey = tx.paidAt.toISOString().split('T')[0]
            dailyMap.set(dateKey, (dailyMap.get(dateKey) ?? 0) + tx.amount)
        }
    }

    return Array.from(dailyMap.entries())
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date))
}

export async function getIncomeByField(dateRange: DateRange): Promise<{ fieldName: string; amount: number; count: number }[]> {
    await requireAuth()

    const { from, to } = dateRange

    const transactions = await prisma.transaction.findMany({
        where: {
            paymentStatus: 'PAID',
            paidAt: {
                gte: startOfDay(from),
                lte: endOfDay(to),
            },
        },
        select: {
            amount: true,
            booking: {
                select: {
                    field: {
                        select: { name: true },
                    },
                },
            },
        },
    })

    // Group by field
    const fieldMap = new Map<string, { amount: number; count: number }>()

    for (const tx of transactions) {
        const fieldName = tx.booking.field.name
        const existing = fieldMap.get(fieldName) ?? { amount: 0, count: 0 }
        fieldMap.set(fieldName, {
            amount: existing.amount + tx.amount,
            count: existing.count + 1,
        })
    }

    return Array.from(fieldMap.entries())
        .map(([fieldName, data]) => ({ fieldName, ...data }))
        .sort((a, b) => b.amount - a.amount)
}

export async function getExpensesByCategory(dateRange: DateRange): Promise<{ category: string; amount: number }[]> {
    await requireAuth()

    const { from, to } = dateRange

    const expenses = await prisma.expense.findMany({
        where: {
            date: {
                gte: startOfDay(from),
                lte: endOfDay(to),
            },
        },
        select: {
            amount: true,
            category: true,
        },
    })

    // Group by category
    const categoryMap = new Map<string, number>()

    for (const expense of expenses) {
        const category = expense.category ?? 'Lainnya'
        categoryMap.set(category, (categoryMap.get(category) ?? 0) + expense.amount)
    }

    return Array.from(categoryMap.entries())
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
}
