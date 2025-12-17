'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { MapPin } from 'lucide-react'
import { FieldActions } from '@/components/fields/field-form'
import type { Field } from '@/types'

interface FieldsClientProps {
    initialFields: Field[]
}

export function FieldsClient({ initialFields }: FieldsClientProps) {
    const router = useRouter()

    const handleUpdate = () => {
        router.refresh()
    }

    if (initialFields.length === 0) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="py-16">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">Belum Ada Lapangan</h3>
                        <p>Tambahkan lapangan pertama untuk mulai menerima booking</p>
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
                            <TableHead className="font-semibold">Nama Lapangan</TableHead>
                            <TableHead className="font-semibold">Deskripsi</TableHead>
                            <TableHead className="font-semibold">Harga/Jam</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="text-right font-semibold">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialFields.map((field) => (
                            <TableRow key={field.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <span className="font-medium">{field.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-600 dark:text-gray-400">
                                    {field.description || '-'}
                                </TableCell>
                                <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(field.pricePerHour)}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        className={
                                            field.isActive
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                        }
                                    >
                                        {field.isActive ? 'Aktif' : 'Nonaktif'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <FieldActions field={field} onUpdate={handleUpdate} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
