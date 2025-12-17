'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { updateBookingStatus } from '@/actions/bookings'
import {
    formatCurrency,
    BOOKING_STATUS_LABELS,
    BOOKING_STATUS_COLORS,
    PAYMENT_STATUS_LABELS,
    PAYMENT_STATUS_COLORS
} from '@/lib/constants'
import { STATUS_ACTIONS } from '@/services/booking-state-machine'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Calendar, MoreHorizontal, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { BookingFull, BookingStatus, Field } from '@/types'

interface BookingsClientProps {
    initialBookings: BookingFull[]
    fields: Field[]
}

export function BookingsClient({ initialBookings, fields }: BookingsClientProps) {
    const router = useRouter()
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
        setLoadingId(bookingId)
        const result = await updateBookingStatus(bookingId, newStatus)
        setLoadingId(null)

        if (result.success) {
            toast.success(`Status berhasil diubah ke ${BOOKING_STATUS_LABELS[newStatus]}`)
            router.refresh()
        } else {
            toast.error(result.error)
        }
    }

    if (initialBookings.length === 0) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="py-16">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">Belum Ada Booking</h3>
                        <p>Buat booking pertama untuk mulai mengelola reservasi</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-0 shadow-lg">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                            <TableHead className="font-semibold">Tanggal</TableHead>
                            <TableHead className="font-semibold">Waktu</TableHead>
                            <TableHead className="font-semibold">Lapangan</TableHead>
                            <TableHead className="font-semibold">Penyewa</TableHead>
                            <TableHead className="font-semibold">Total</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Pembayaran</TableHead>
                            <TableHead className="text-right font-semibold">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialBookings.map((booking) => {
                            const actions = STATUS_ACTIONS[booking.status]
                            const isLoading = loadingId === booking.id

                            return (
                                <TableRow key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <TableCell className="font-medium">
                                        {format(new Date(booking.date), 'dd MMM yyyy', { locale: localeId })}
                                    </TableCell>
                                    <TableCell>
                                        {booking.startTime} - {booking.endTime}
                                    </TableCell>
                                    <TableCell>{booking.field.name}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{booking.customerName}</p>
                                            {booking.customerPhone && (
                                                <p className="text-sm text-gray-500">{booking.customerPhone}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(booking.totalPrice)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={BOOKING_STATUS_COLORS[booking.status]}>
                                            {BOOKING_STATUS_LABELS[booking.status]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {booking.transaction ? (
                                            <Badge className={PAYMENT_STATUS_COLORS[booking.transaction.paymentStatus]}>
                                                {PAYMENT_STATUS_LABELS[booking.transaction.paymentStatus]}
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                                Belum Ada
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {actions.nextActions.length > 0 && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" disabled={isLoading}>
                                                        {isLoading ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {actions.nextActions.map((action) => (
                                                        <DropdownMenuItem
                                                            key={action.status}
                                                            onClick={() => handleStatusChange(booking.id, action.status)}
                                                            className={
                                                                action.variant === 'destructive'
                                                                    ? 'text-red-600 focus:text-red-600'
                                                                    : ''
                                                            }
                                                        >
                                                            {action.label}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
