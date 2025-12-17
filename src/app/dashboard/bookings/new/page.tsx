import { getActiveFields } from '@/actions/fields'
import { getTimeSlots } from '@/actions/timeslots'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Clock } from 'lucide-react'
import { NewBookingForm } from './new-booking-form'

export default async function NewBookingPage() {
    const [fields, timeSlots] = await Promise.all([
        getActiveFields(),
        getTimeSlots(),
    ])

    if (fields.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Buat Booking</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Reservasi lapangan baru
                    </p>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardContent className="py-16">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                            <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium mb-2">Tidak Ada Lapangan Aktif</h3>
                            <p>Aktifkan atau tambah lapangan terlebih dahulu</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (timeSlots.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Buat Booking</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Reservasi lapangan baru
                    </p>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardContent className="py-16">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                            <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium mb-2">Tidak Ada Kategori Waktu</h3>
                            <p>Buat kategori waktu terlebih dahulu di menu Pengaturan</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Buat Booking</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Reservasi lapangan baru
                </p>
            </div>

            <div className="max-w-3xl">
                <NewBookingForm fields={fields} timeSlots={timeSlots} />
            </div>
        </div>
    )
}
