'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { createTransaction, markTransactionAsPaid } from '@/actions/transactions'
import {
    formatCurrency,
    PAYMENT_STATUS_LABELS,
    PAYMENT_STATUS_COLORS,
    PAYMENT_METHOD_LABELS
} from '@/lib/constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { CreditCard, Plus, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { TransactionWithBooking, BookingFull, PaymentMethod, PaymentStatus } from '@/types'

interface TransactionsClientProps {
    initialTransactions: TransactionWithBooking[]
    bookingsWithoutTransaction: BookingFull[]
}

export function TransactionsClient({
    initialTransactions,
    bookingsWithoutTransaction
}: TransactionsClientProps) {
    const router = useRouter()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [markingPaidId, setMarkingPaidId] = useState<string | null>(null)
    const [selectedBookingId, setSelectedBookingId] = useState<string>('')
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')

    const selectedBooking = bookingsWithoutTransaction.find((b) => b.id === selectedBookingId)

    const handleCreateTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedBooking) return

        setIsSubmitting(true)
        const formData = new FormData()
        formData.set('bookingId', selectedBooking.id)
        formData.set('amount', selectedBooking.totalPrice.toString())
        formData.set('paymentMethod', paymentMethod)

        const result = await createTransaction(null, formData)
        setIsSubmitting(false)

        if (result.success) {
            toast.success('Transaksi berhasil dibuat')
            setIsDialogOpen(false)
            setSelectedBookingId('')
            router.refresh()
        } else {
            toast.error(result.error)
        }
    }

    const handleMarkAsPaid = async (transactionId: string) => {
        setMarkingPaidId(transactionId)
        const result = await markTransactionAsPaid(transactionId)
        setMarkingPaidId(null)

        if (result.success) {
            toast.success('Transaksi ditandai lunas')
            router.refresh()
        } else {
            toast.error(result.error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Create Transaction Button */}
            {bookingsWithoutTransaction.length > 0 && (
                <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {bookingsWithoutTransaction.length} booking menunggu pembayaran
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Buat transaksi untuk mencatat pembayaran
                                </p>
                            </div>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-600">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Buat Transaksi
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Buat Transaksi Baru</DialogTitle>
                                        <DialogDescription>
                                            Pilih booking dan metode pembayaran
                                        </DialogDescription>
                                    </DialogHeader>

                                    <form onSubmit={handleCreateTransaction} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Booking</Label>
                                            <Select
                                                value={selectedBookingId}
                                                onValueChange={setSelectedBookingId}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih booking" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {bookingsWithoutTransaction.map((booking) => (
                                                        <SelectItem key={booking.id} value={booking.id}>
                                                            {booking.customerName} - {booking.field.name} -{' '}
                                                            {format(new Date(booking.date), 'dd MMM', { locale: localeId })}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {selectedBooking && (
                                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                                                    <span className="font-bold text-lg text-emerald-600">
                                                        {formatCurrency(selectedBooking.totalPrice)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label>Metode Pembayaran</Label>
                                            <Select
                                                value={paymentMethod}
                                                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="CASH">Tunai</SelectItem>
                                                    <SelectItem value="TRANSFER">Transfer Bank</SelectItem>
                                                    <SelectItem value="EWALLET">E-Wallet</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                                Batal
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting || !selectedBookingId}
                                                className="bg-gradient-to-r from-blue-500 to-indigo-600"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Menyimpan...
                                                    </>
                                                ) : (
                                                    'Buat Transaksi'
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Transactions List */}
            {initialTransactions.length === 0 ? (
                <Card className="border-0 shadow-lg">
                    <CardContent className="py-16">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                            <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium mb-2">Belum Ada Transaksi</h3>
                            <p>Transaksi akan muncul setelah pembayaran dicatat</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                                    <TableHead className="font-semibold">Tanggal</TableHead>
                                    <TableHead className="font-semibold">Booking</TableHead>
                                    <TableHead className="font-semibold">Lapangan</TableHead>
                                    <TableHead className="font-semibold">Metode</TableHead>
                                    <TableHead className="font-semibold">Jumlah</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="text-right font-semibold">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialTransactions.map((transaction) => (
                                    <TableRow key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <TableCell>
                                            {format(new Date(transaction.createdAt), 'dd MMM yyyy', { locale: localeId })}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{transaction.booking.customerName}</p>
                                                <p className="text-sm text-gray-500">
                                                    {format(new Date(transaction.booking.date), 'dd MMM', { locale: localeId })} •{' '}
                                                    {transaction.booking.startTime}-{transaction.booking.endTime}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{transaction.booking.field.name}</TableCell>
                                        <TableCell>
                                            {PAYMENT_METHOD_LABELS[transaction.paymentMethod]}
                                        </TableCell>
                                        <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(transaction.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={PAYMENT_STATUS_COLORS[transaction.paymentStatus]}>
                                                {PAYMENT_STATUS_LABELS[transaction.paymentStatus]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {transaction.paymentStatus === 'UNPAID' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleMarkAsPaid(transaction.id)}
                                                    disabled={markingPaidId === transaction.id}
                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                >
                                                    {markingPaidId === transaction.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Check className="w-4 h-4 mr-1" />
                                                            Lunas
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
