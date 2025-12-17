import { getBookings } from '@/actions/bookings'
import { getFields } from '@/actions/fields'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar } from 'lucide-react'
import Link from 'next/link'
import { BookingsClient } from './bookings-client'

export default async function BookingsPage() {
    const [bookings, fields] = await Promise.all([
        getBookings(),
        getFields(),
    ])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Booking</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Kelola reservasi lapangan
                    </p>
                </div>
                <Link href="/dashboard/bookings/new">
                    <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg">
                        <Plus className="w-4 h-4 mr-2" />
                        Buat Booking
                    </Button>
                </Link>
            </div>

            {/* Bookings List */}
            <BookingsClient initialBookings={bookings} fields={fields} />
        </div>
    )
}
