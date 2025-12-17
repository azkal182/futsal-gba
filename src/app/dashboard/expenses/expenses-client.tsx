'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { createExpense, deleteExpense } from '@/actions/expenses'
import { formatCurrency } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
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
import { Receipt, Plus, Loader2, CalendarIcon, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Expense } from '@/types'

interface ExpensesClientProps {
    initialExpenses: Expense[]
}

export function ExpensesClient({ initialExpenses }: ExpensesClientProps) {
    const router = useRouter()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())

    const handleCreateExpense = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        formData.set('date', format(selectedDate, 'yyyy-MM-dd'))

        setIsSubmitting(true)
        const result = await createExpense(null, formData)
        setIsSubmitting(false)

        if (result.success) {
            toast.success('Pengeluaran berhasil ditambahkan')
            setIsDialogOpen(false)
            router.refresh()
        } else {
            toast.error(result.error)
        }
    }

    const handleDelete = async (expenseId: string) => {
        if (!confirm('Yakin ingin menghapus pengeluaran ini?')) return

        setDeletingId(expenseId)
        const result = await deleteExpense(expenseId)
        setDeletingId(null)

        if (result.success) {
            toast.success('Pengeluaran berhasil dihapus')
            router.refresh()
        } else {
            toast.error(result.error)
        }
    }

    // Calculate total
    const totalExpenses = initialExpenses.reduce((sum, exp) => sum + exp.amount, 0)

    return (
        <div className="space-y-6">
            {/* Summary and Add Button */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-0 shadow-lg bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Pengeluaran</p>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {formatCurrency(totalExpenses)}
                                </p>
                            </div>
                            <Receipt className="w-10 h-10 text-red-400 opacity-75" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardContent className="py-4 flex items-center justify-center">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-red-500 to-orange-600">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Pengeluaran
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Tambah Pengeluaran</DialogTitle>
                                    <DialogDescription>
                                        Catat pengeluaran operasional
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleCreateExpense} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Tanggal</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal'
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {format(selectedDate, 'dd MMMM yyyy', { locale: localeId })}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={selectedDate}
                                                    onSelect={(date) => date && setSelectedDate(date)}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Jumlah (Rp)</Label>
                                        <Input
                                            id="amount"
                                            name="amount"
                                            type="number"
                                            placeholder="100000"
                                            min={0}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Deskripsi</Label>
                                        <Input
                                            id="description"
                                            name="description"
                                            placeholder="Contoh: Bayar listrik bulanan"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category">Kategori (Opsional)</Label>
                                        <Input
                                            id="category"
                                            name="category"
                                            placeholder="Contoh: Utilitas, Perawatan, dll"
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="bg-gradient-to-r from-red-500 to-orange-600"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                'Simpan'
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>

            {/* Expenses List */}
            {initialExpenses.length === 0 ? (
                <Card className="border-0 shadow-lg">
                    <CardContent className="py-16">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                            <Receipt className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium mb-2">Belum Ada Pengeluaran</h3>
                            <p>Catat pengeluaran untuk melacak biaya operasional</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table className="min-w-[600px]">
                                <TableHeader>
                                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                                        <TableHead className="font-semibold pl-4 sm:pl-6">Tanggal</TableHead>
                                        <TableHead className="font-semibold">Deskripsi</TableHead>
                                        <TableHead className="font-semibold">Kategori</TableHead>
                                        <TableHead className="font-semibold">Jumlah</TableHead>
                                        <TableHead className="text-right font-semibold pr-4 sm:pr-6">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {initialExpenses.map((expense) => (
                                        <TableRow key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <TableCell className="pl-4 sm:pl-6">
                                                {format(new Date(expense.date), 'dd MMM yyyy', { locale: localeId })}
                                            </TableCell>
                                            <TableCell className="font-medium">{expense.description}</TableCell>
                                            <TableCell>
                                                {expense.category ? (
                                                    <Badge variant="outline">{expense.category}</Badge>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium text-red-600 dark:text-red-400">
                                                {formatCurrency(expense.amount)}
                                            </TableCell>
                                            <TableCell className="text-right pr-4 sm:pr-6">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(expense.id)}
                                                    disabled={deletingId === expense.id}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    {deletingId === expense.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
