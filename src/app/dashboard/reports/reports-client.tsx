'use client'

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { getFinancialSummary, getIncomeByField, getExpensesByCategory } from '@/actions/reports'
import { getPresetDateRange } from '@/lib/date-utils'
import { formatCurrency } from '@/lib/constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
    TrendingUp,
    TrendingDown,
    DollarSign,
    CalendarIcon,
    Loader2,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FinancialSummary, DateRange } from '@/types'

interface ReportsClientProps {
    initialSummary: FinancialSummary
    initialIncomeByField: { fieldName: string; amount: number; count: number }[]
    initialExpensesByCategory: { category: string; amount: number }[]
    defaultRange: DateRange
}

type PresetType = 'today' | 'week' | 'month' | 'year' | 'custom'

export function ReportsClient({
    initialSummary,
    initialIncomeByField,
    initialExpensesByCategory,
    defaultRange
}: ReportsClientProps) {
    const [isPending, startTransition] = useTransition()
    const [selectedPreset, setSelectedPreset] = useState<PresetType>('month')
    const [dateRange, setDateRange] = useState<DateRange>(defaultRange)
    const [summary, setSummary] = useState(initialSummary)
    const [incomeByField, setIncomeByField] = useState(initialIncomeByField)
    const [expensesByCategory, setExpensesByCategory] = useState(initialExpensesByCategory)

    const handlePresetChange = (preset: PresetType) => {
        if (preset === 'custom') {
            setSelectedPreset('custom')
            return
        }

        setSelectedPreset(preset)
        const range = getPresetDateRange(preset)
        setDateRange(range)
        fetchData(range)
    }

    const handleCustomDateChange = (range: DateRange) => {
        setDateRange(range)
        setSelectedPreset('custom')
        fetchData(range)
    }

    const fetchData = (range: DateRange) => {
        startTransition(async () => {
            const [newSummary, newIncomeByField, newExpensesByCategory] = await Promise.all([
                getFinancialSummary(range),
                getIncomeByField(range),
                getExpensesByCategory(range),
            ])
            setSummary(newSummary)
            setIncomeByField(newIncomeByField)
            setExpensesByCategory(newExpensesByCategory)
        })
    }

    const presetButtons: { value: PresetType; label: string }[] = [
        { value: 'today', label: 'Hari Ini' },
        { value: 'week', label: 'Minggu Ini' },
        { value: 'month', label: 'Bulan Ini' },
        { value: 'year', label: 'Tahun Ini' },
    ]

    return (
        <div className="space-y-6">
            {/* Period Selector */}
            <Card className="border-0 shadow-lg">
                <CardContent className="py-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Periode:</span>
                        {presetButtons.map((preset) => (
                            <Button
                                key={preset.value}
                                variant={selectedPreset === preset.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handlePresetChange(preset.value)}
                                disabled={isPending}
                                className={selectedPreset === preset.value ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : ''}
                            >
                                {preset.label}
                            </Button>
                        ))}

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={selectedPreset === 'custom' ? 'default' : 'outline'}
                                    size="sm"
                                    className={cn(
                                        selectedPreset === 'custom' && 'bg-gradient-to-r from-emerald-500 to-teal-600'
                                    )}
                                >
                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                    Kustom
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="range"
                                    selected={{ from: dateRange.from, to: dateRange.to }}
                                    onSelect={(range) => {
                                        if (range?.from && range?.to) {
                                            handleCustomDateChange({ from: range.from, to: range.to })
                                        }
                                    }}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>

                        {isPending && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    </div>

                    <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        {format(dateRange.from, 'd MMMM yyyy', { locale: localeId })} -{' '}
                        {format(dateRange.to, 'd MMMM yyyy', { locale: localeId })}
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium opacity-90">
                            Total Pemasukan
                        </CardTitle>
                        <ArrowUpRight className="h-5 w-5 opacity-75" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatCurrency(summary.totalIncome)}</div>
                        <p className="text-sm opacity-75 mt-1">
                            {summary.transactionCount} transaksi lunas
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-orange-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium opacity-90">
                            Total Pengeluaran
                        </CardTitle>
                        <ArrowDownRight className="h-5 w-5 opacity-75" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatCurrency(summary.totalExpense)}</div>
                        <p className="text-sm opacity-75 mt-1">
                            Biaya operasional
                        </p>
                    </CardContent>
                </Card>

                <Card className={cn(
                    'border-0 shadow-lg text-white',
                    summary.profit >= 0
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        : 'bg-gradient-to-br from-gray-600 to-gray-800'
                )}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium opacity-90">
                            {summary.profit >= 0 ? 'Laba Bersih' : 'Rugi Bersih'}
                        </CardTitle>
                        {summary.profit >= 0 ? (
                            <TrendingUp className="h-5 w-5 opacity-75" />
                        ) : (
                            <TrendingDown className="h-5 w-5 opacity-75" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {summary.profit >= 0 ? '' : '-'}{formatCurrency(Math.abs(summary.profit))}
                        </div>
                        <p className="text-sm opacity-75 mt-1">
                            Pemasukan - Pengeluaran
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Breakdown Tables */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Income by Field */}
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg">Pemasukan per Lapangan</CardTitle>
                        <CardDescription>Breakdown pendapatan berdasarkan lapangan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {incomeByField.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Tidak ada data untuk periode ini</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Lapangan</TableHead>
                                        <TableHead className="text-right">Transaksi</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {incomeByField.map((item) => (
                                        <TableRow key={item.fieldName}>
                                            <TableCell className="font-medium">{item.fieldName}</TableCell>
                                            <TableCell className="text-right">{item.count}x</TableCell>
                                            <TableCell className="text-right font-medium text-emerald-600">
                                                {formatCurrency(item.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Expenses by Category */}
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg">Pengeluaran per Kategori</CardTitle>
                        <CardDescription>Breakdown biaya berdasarkan kategori</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {expensesByCategory.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <TrendingDown className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Tidak ada pengeluaran untuk periode ini</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expensesByCategory.map((item) => (
                                        <TableRow key={item.category}>
                                            <TableCell className="font-medium">{item.category}</TableCell>
                                            <TableCell className="text-right font-medium text-red-600">
                                                {formatCurrency(item.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
