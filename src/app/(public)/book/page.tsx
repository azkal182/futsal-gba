import { Suspense } from 'react'
import { getPublicFields } from '@/actions/fields'
import { getTimeSlots } from '@/actions/timeslots'
import { PublicBookingForm } from './booking-form'
import { Loader2 } from 'lucide-react'

export default async function PublicBookPage({
    searchParams,
}: {
    searchParams: Promise<{ field?: string }>
}) {
    const { field: preselectedFieldId } = await searchParams
    const [activeFields, timeSlots] = await Promise.all([
        getPublicFields(),
        getTimeSlots(),
    ])

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            Booking Lapangan
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Pilih lapangan, tanggal, dan waktu yang Anda inginkan
                        </p>
                    </div>

                    <Suspense fallback={
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    }>
                        <PublicBookingForm
                            fields={activeFields}
                            timeSlots={timeSlots}
                            preselectedFieldId={preselectedFieldId}
                        />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
