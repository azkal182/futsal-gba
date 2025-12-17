import { Suspense } from 'react'
import Link from 'next/link'
import { getPublicFields } from '@/actions/fields'
import { getTimeSlots } from '@/actions/timeslots'
import { ScheduleView } from './schedule-view'
import { Button } from '@/components/ui/button'
import { Calendar, Loader2 } from 'lucide-react'

export default async function SchedulePage() {
    const [activeFields, timeSlots] = await Promise.all([
        getPublicFields(),
        getTimeSlots(),
    ])

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                Jadwal Lapangan
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Lihat ketersediaan lapangan untuk hari ini dan hari-hari mendatang
                            </p>
                        </div>
                        <Link href="/book">
                            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                                <Calendar className="w-4 h-4 mr-2" />
                                Booking Sekarang
                            </Button>
                        </Link>
                    </div>

                    <Suspense fallback={
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    }>
                        <ScheduleView fields={activeFields} timeSlots={timeSlots} />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
