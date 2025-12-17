import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { formatCurrency } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Calendar, Clock, MapPin, Phone, User, Home } from 'lucide-react'

export default async function ConfirmationPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>
}) {
    const { id } = await searchParams

    if (!id) {
        return (
            <div className="min-h-screen py-12">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Booking tidak ditemukan
                    </h1>
                    <Link href="/">
                        <Button>Kembali ke Beranda</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const booking = await prisma.booking.findUnique({
        where: { id },
        include: { field: true },
    })

    if (!booking) {
        return (
            <div className="min-h-screen py-12">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Booking tidak ditemukan
                    </h1>
                    <Link href="/">
                        <Button>Kembali ke Beranda</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Success Icon */}
                    <div className="text-center mb-8">
                        <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            Booking Berhasil!
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Booking Anda sedang menunggu konfirmasi dari admin
                        </p>
                    </div>

                    {/* Booking Details */}
                    <Card className="border-0 shadow-xl mb-6">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Kode Booking</p>
                                    <p className="text-2xl font-bold font-mono text-emerald-600">
                                        {booking.id.slice(-8).toUpperCase()}
                                    </p>
                                </div>
                                <div className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 rounded-lg font-medium">
                                    Menunggu Konfirmasi
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Lapangan</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{booking.field.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Tanggal</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {format(new Date(booking.date), 'EEEE, d MMMM yyyy', { locale: localeId })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center shrink-0">
                                        <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Waktu</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {booking.startTime} - {booking.endTime} ({booking.duration} jam)
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center shrink-0">
                                        <User className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Nama Pemesan</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{booking.customerName}</p>
                                    </div>
                                </div>

                                {booking.customerPhone && (
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900 flex items-center justify-center shrink-0">
                                            <Phone className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">No. WhatsApp</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{booking.customerPhone}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <p className="text-lg text-gray-600 dark:text-gray-400">Total Pembayaran</p>
                                        <p className="text-3xl font-bold text-emerald-600">
                                            {formatCurrency(booking.totalPrice)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info Box */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Langkah Selanjutnya</h3>
                        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                            <li>• Admin akan mengkonfirmasi booking Anda dalam waktu 1x24 jam</li>
                            <li>• Anda akan dihubungi melalui WhatsApp untuk konfirmasi</li>
                            <li>• Pembayaran dapat dilakukan di tempat saat bermain</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/" className="flex-1">
                            <Button variant="outline" className="w-full h-12">
                                <Home className="w-4 h-4 mr-2" />
                                Kembali ke Beranda
                            </Button>
                        </Link>
                        <Link href="/book" className="flex-1">
                            <Button className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                                <Calendar className="w-4 h-4 mr-2" />
                                Booking Lagi
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
