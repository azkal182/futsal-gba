import { getTransactions } from '@/actions/transactions'
import { getBookings } from '@/actions/bookings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard } from 'lucide-react'
import { TransactionsClient } from './transactions-client'

export default async function TransactionsPage() {
    const [transactions, bookings] = await Promise.all([
        getTransactions(),
        getBookings({ status: 'CONFIRMED' }),
    ])

    // Filter bookings without transactions
    const bookingsWithoutTransaction = bookings.filter((b) => !b.transaction)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transaksi</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Kelola pembayaran dan transaksi
                </p>
            </div>

            {/* Transactions List */}
            <TransactionsClient
                initialTransactions={transactions}
                bookingsWithoutTransaction={bookingsWithoutTransaction}
            />
        </div>
    )
}
