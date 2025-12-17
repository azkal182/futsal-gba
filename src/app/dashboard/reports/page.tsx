import { getFinancialSummary, getIncomeByField, getExpensesByCategory } from '@/actions/reports'
import { getPresetDateRange } from '@/lib/date-utils'
import { ReportsClient } from './reports-client'
import { startOfMonth, endOfMonth } from 'date-fns'

export default async function ReportsPage() {
    // Default to current month
    const defaultRange = getPresetDateRange('month')

    const [summary, incomeByField, expensesByCategory] = await Promise.all([
        getFinancialSummary(defaultRange),
        getIncomeByField(defaultRange),
        getExpensesByCategory(defaultRange),
    ])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Laporan Keuangan</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Ringkasan pemasukan, pengeluaran, dan laba rugi
                </p>
            </div>

            {/* Reports Content */}
            <ReportsClient
                initialSummary={summary}
                initialIncomeByField={incomeByField}
                initialExpensesByCategory={expensesByCategory}
                defaultRange={defaultRange}
            />
        </div>
    )
}
