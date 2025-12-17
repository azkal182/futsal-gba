'use client'

import { useState, useTransition } from 'react'
import type { TimeSlot } from '@/generated/prisma/client'
import { toggleTimeSlotStatus, deleteTimeSlot } from '@/actions/timeslots'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { EditTimeSlotDialog } from './edit-dialog'
import { Clock, Trash2, GripVertical, Sunrise, Sun, Sunset } from 'lucide-react'
import { toast } from 'sonner'

interface TimeSlotsListProps {
    timeSlots: TimeSlot[]
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    'pagi': <Sunrise className="w-5 h-5 text-amber-500" />,
    'siang': <Sun className="w-5 h-5 text-yellow-500" />,
    'sore': <Sunset className="w-5 h-5 text-orange-500" />,
    'malam': <Clock className="w-5 h-5 text-indigo-500" />,
}

function getCategoryIcon(name: string): React.ReactNode {
    const key = name.toLowerCase()
    return CATEGORY_ICONS[key] || <Clock className="w-5 h-5 text-gray-500" />
}

export function TimeSlotsList({ timeSlots }: TimeSlotsListProps) {
    const [isPending, startTransition] = useTransition()

    const handleToggleStatus = (id: string, currentStatus: boolean) => {
        startTransition(async () => {
            const result = await toggleTimeSlotStatus(id)
            if (result.success) {
                toast.success(currentStatus ? 'Kategori dinonaktifkan' : 'Kategori diaktifkan')
            } else {
                toast.error(result.error)
            }
        })
    }

    const handleDelete = (id: string, name: string) => {
        if (!confirm(`Hapus kategori "${name}"?`)) return

        startTransition(async () => {
            const result = await deleteTimeSlot(id)
            if (result.success) {
                toast.success('Kategori berhasil dihapus')
            } else {
                toast.error(result.error)
            }
        })
    }

    return (
        <div className="space-y-3">
            {timeSlots.map((slot) => (
                <Card
                    key={slot.id}
                    className={`border-l-4 ${slot.isActive ? 'border-l-emerald-500' : 'border-l-gray-300 opacity-60'}`}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="text-gray-400 cursor-move">
                                    <GripVertical className="w-5 h-5" />
                                </div>

                                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    {getCategoryIcon(slot.name)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {slot.name}
                                        </h3>
                                        {!slot.isActive && (
                                            <Badge variant="secondary" className="text-xs">
                                                Nonaktif
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {slot.startTime} - {slot.endTime}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Aktif</span>
                                    <Switch
                                        checked={slot.isActive}
                                        onCheckedChange={() => handleToggleStatus(slot.id, slot.isActive)}
                                        disabled={isPending}
                                    />
                                </div>

                                <EditTimeSlotDialog timeSlot={slot} />

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(slot.id, slot.name)}
                                    disabled={isPending}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
