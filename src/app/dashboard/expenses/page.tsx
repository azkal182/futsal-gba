import { getExpenses } from '@/actions/expenses'
import { ExpensesClient } from './expenses-client'

export default async function ExpensesPage() {
    const expenses = await getExpenses()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pengeluaran</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Catat dan kelola pengeluaran operasional
                </p>
            </div>

            {/* Expenses List */}
            <ExpensesClient initialExpenses={expenses} />
        </div>
    )
}
