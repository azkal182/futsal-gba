import { getFields } from '@/actions/fields'
import { formatCurrency } from '@/lib/constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus, MapPin } from 'lucide-react'
import { FieldFormDialog, FieldActions } from '@/components/fields/field-form'
import { FieldsClient } from './fields-client'

export default async function FieldsPage() {
    const fields = await getFields()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lapangan</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Kelola lapangan futsal dan harga sewa
                    </p>
                </div>
                <FieldFormDialog
                    trigger={
                        <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Lapangan
                        </Button>
                    }
                />
            </div>

            {/* Fields List */}
            <FieldsClient initialFields={fields} />
        </div>
    )
}
