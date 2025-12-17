import { getAllTimeSlots } from '@/actions/timeslots'
import { requireRole } from '@/lib/auth'
import { TimeSlotsList } from './timeslots-list'
import { CreateTimeSlotDialog } from './create-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'

export default async function TimeSlotSettingsPage() {
    await requireRole(['OWNER'])

    const timeSlots = await getAllTimeSlots()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Kategori Waktu
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Atur kategori waktu booking (Pagi, Siang, Sore, dll)
                    </p>
                </div>
                <CreateTimeSlotDialog />
            </div>

            {timeSlots.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-12">
                        <div className="text-center">
                            <Clock className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Belum Ada Kategori Waktu
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                Buat kategori waktu untuk mengatur jam operasional booking
                            </p>
                            <CreateTimeSlotDialog />
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <TimeSlotsList timeSlots={timeSlots} />
            )}

            {/* Info Card */}
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                    <CardTitle className="text-blue-800 dark:text-blue-300 text-lg">
                        💡 Tips Pengaturan
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-blue-700 dark:text-blue-400 text-sm space-y-2">
                    <p>• Kategori waktu menentukan jam operasional yang tersedia untuk booking</p>
                    <p>• Contoh: Pagi (06:00-10:00), Siang (10:00-15:00), Sore (15:00-22:00)</p>
                    <p>• Customer akan melihat slot jam yang tersedia berdasarkan kategori ini</p>
                    <p>• Nonaktifkan kategori untuk menutup sementara jam operasional tersebut</p>
                </CardContent>
            </Card>
        </div>
    )
}
