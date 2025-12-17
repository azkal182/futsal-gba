import { prisma } from '@/lib/prisma'
import { getTodayBookings, getBookingStats } from '@/actions/bookings'
import { getTodayIncome } from '@/actions/transactions'
import { formatCurrency, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/lib/constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Calendar,
    DollarSign,
    Clock,
    MapPin,
    ArrowRight,
    TrendingUp,
    Users
} from 'lucide-react'
import Link from 'next/link'
import { startOfDay, endOfDay, format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

async function getFieldsStatus() {
    const today = new Date()

    const fields = await prisma.field.findMany({
        where: { isActive: true },
        include: {
            bookings: {
                where: {
                    date: {
                        gte: startOfDay(today),
                        lte: endOfDay(today),
                    },
                    status: {
                        in: ['PENDING', 'CONFIRMED'],
                    },
                },
                select: { startTime: true, endTime: true, status: true },
            },
        },
    })

    return fields.map((field) => ({
        id: field.id,
        name: field.name,
        bookingsToday: field.bookings.length,
        isOccupied: field.bookings.some((b) => {
            const now = new Date()
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
            return b.startTime <= currentTime && b.endTime > currentTime
        }),
    }))
}

export default async function DashboardPage() {
    const [todayBookings, stats, todayIncome, fieldsStatus] = await Promise.all([
        getTodayBookings(),
        getBookingStats(),
        getTodayIncome(),
        getFieldsStatus(),
    ])

    const today = new Date()
    const formattedDate = format(today, 'EEEE, d MMMM yyyy', { locale: localeId })

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{formattedDate}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium opacity-90">
                            Booking Hari Ini
                        </CardTitle>
                        <Calendar className="h-5 w-5 opacity-75" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.todayBookings}</div>
                        <p className="text-sm opacity-75 mt-1">
                            {stats.confirmedBookings} dikonfirmasi
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium opacity-90">
                            Pemasukan Hari Ini
                        </CardTitle>
                        <DollarSign className="h-5 w-5 opacity-75" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatCurrency(todayIncome)}</div>
                        <p className="text-sm opacity-75 mt-1">
                            Dari transaksi lunas
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium opacity-90">
                            Menunggu Konfirmasi
                        </CardTitle>
                        <Clock className="h-5 w-5 opacity-75" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.pendingBookings}</div>
                        <p className="text-sm opacity-75 mt-1">
                            Perlu ditindak
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium opacity-90">
                            Lapangan Aktif
                        </CardTitle>
                        <MapPin className="h-5 w-5 opacity-75" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{fieldsStatus.length}</div>
                        <p className="text-sm opacity-75 mt-1">
                            {fieldsStatus.filter((f) => f.isOccupied).length} sedang terpakai
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Today's Bookings */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Booking Hari Ini</CardTitle>
                            <CardDescription>Daftar booking untuk hari ini</CardDescription>
                        </div>
                        <Link href="/dashboard/bookings">
                            <Button variant="ghost" size="sm" className="gap-1">
                                Lihat Semua <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {todayBookings.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Tidak ada booking hari ini</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {todayBookings.slice(0, 5).map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {booking.customerName}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {booking.field.name} • {booking.startTime} - {booking.endTime}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className={BOOKING_STATUS_COLORS[booking.status]}>
                                            {BOOKING_STATUS_LABELS[booking.status]}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Field Status */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Status Lapangan</CardTitle>
                            <CardDescription>Kondisi lapangan saat ini</CardDescription>
                        </div>
                        <Link href="/dashboard/fields">
                            <Button variant="ghost" size="sm" className="gap-1">
                                Kelola <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {fieldsStatus.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Belum ada lapangan aktif</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {fieldsStatus.map((field) => (
                                    <div
                                        key={field.id}
                                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${field.isOccupied
                                                    ? 'bg-red-100 dark:bg-red-900/30'
                                                    : 'bg-green-100 dark:bg-green-900/30'
                                                    }`}
                                            >
                                                <MapPin
                                                    className={`w-5 h-5 ${field.isOccupied
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : 'text-green-600 dark:text-green-400'
                                                        }`}
                                                />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {field.name}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {field.bookingsToday} booking hari ini
                                                </p>
                                            </div>
                                        </div>
                                        <Badge
                                            className={
                                                field.isOccupied
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                            }
                                        >
                                            {field.isOccupied ? 'Terpakai' : 'Tersedia'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg">Aksi Cepat</CardTitle>
                    <CardDescription>Pintasan untuk tugas-tugas umum</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Link href="/dashboard/bookings/new">
                            <Button className="w-full h-auto py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg">
                                <div className="text-center">
                                    <Calendar className="w-6 h-6 mx-auto mb-1" />
                                    <span className="text-sm font-medium">Buat Booking</span>
                                </div>
                            </Button>
                        </Link>
                        <Link href="/dashboard/transactions">
                            <Button variant="outline" className="w-full h-auto py-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <div className="text-center">
                                    <DollarSign className="w-6 h-6 mx-auto mb-1" />
                                    <span className="text-sm font-medium">Transaksi</span>
                                </div>
                            </Button>
                        </Link>
                        <Link href="/dashboard/expenses">
                            <Button variant="outline" className="w-full h-auto py-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <div className="text-center">
                                    <TrendingUp className="w-6 h-6 mx-auto mb-1" />
                                    <span className="text-sm font-medium">Pengeluaran</span>
                                </div>
                            </Button>
                        </Link>
                        <Link href="/dashboard/reports">
                            <Button variant="outline" className="w-full h-auto py-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <div className="text-center">
                                    <Users className="w-6 h-6 mx-auto mb-1" />
                                    <span className="text-sm font-medium">Laporan</span>
                                </div>
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
