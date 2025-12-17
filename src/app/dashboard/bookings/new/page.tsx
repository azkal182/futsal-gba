import { getActiveFields } from '@/actions/fields'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin } from 'lucide-react'
import { NewBookingForm } from './new-booking-form'

export default async function NewBookingPage() {
    const fields = await getActiveFields()

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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Buat Booking</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Reservasi lapangan baru
                </p>
            </div>

            <Card className="border-0 shadow-lg max-w-2xl">
                <CardHeader>
                    <CardTitle>Detail Booking</CardTitle>
                    <CardDescription>Isi informasi booking di bawah ini</CardDescription>
                </CardHeader>
                <CardContent>
                    <NewBookingForm fields={fields} />
                </CardContent>
            </Card>
        </div>
    )
}
