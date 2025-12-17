'use client'

import { useState, useEffect } from 'react'
import { format, addDays } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { getBookedSlotsWithDetails, type SlotDetail } from '@/actions/bookings'
import type { Field } from '@/types'
import type { TimeSlot } from '@/generated/prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CalendarIcon, Loader2, MapPin, ChevronLeft, ChevronRight, Clock, Sunrise, Sun, Sunset, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ScheduleViewProps {
    fields: Field[]
    timeSlots: TimeSlot[]
}

// Helper function to generate hours from time slot
function generateHoursFromSlot(startTime: string, endTime: string): string[] {
    const [startHour] = startTime.split(':').map(Number)
    const [endHour] = endTime.split(':').map(Number)
    const hours: string[] = []
    for (let h = startHour; h < endHour; h++) {
        hours.push(`${h.toString().padStart(2, '0')}:00`)
    }
    return hours
}

// Get all hours from all time slots
function getAllHours(slots: TimeSlot[]): string[] {
    const allHours: string[] = []
    slots.forEach(slot => {
        const hours = generateHoursFromSlot(slot.startTime, slot.endTime)
        allHours.push(...hours)
    })
    return [...new Set(allHours)].sort()
}

// Category icons
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    'pagi': <Sunrise className="w-4 h-4" />,
    'siang': <Sun className="w-4 h-4" />,
    'sore': <Sunset className="w-4 h-4" />,
}

function getCategoryIcon(name: string): React.ReactNode {
    const key = name.toLowerCase()
    return CATEGORY_ICONS[key] || <Clock className="w-4 h-4" />
}

export function ScheduleView({ fields, timeSlots }: ScheduleViewProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [bookedSlotsMap, setBookedSlotsMap] = useState<Record<string, SlotDetail[]>>({})
    const [loading, setLoading] = useState(true)

    const allHours = getAllHours(timeSlots)

    useEffect(() => {
        async function loadAllSlots() {
            setLoading(true)
            const slotsMap: Record<string, SlotDetail[]> = {}

            await Promise.all(
                fields.map(async (field) => {
                    try {
                        const slots = await getBookedSlotsWithDetails(field.id, selectedDate)
                        slotsMap[field.id] = slots
                    } catch (error) {
                        console.error('Failed to load slots for field:', field.id, error)
                        slotsMap[field.id] = []
                    }
                })
            )

            setBookedSlotsMap(slotsMap)
            setLoading(false)
        }

        loadAllSlots()
    }, [fields, selectedDate])

    const goToPreviousDay = () => {
        const prevDay = addDays(selectedDate, -1)
        if (prevDay >= new Date(new Date().setHours(0, 0, 0, 0))) {
            setSelectedDate(prevDay)
        }
    }

    const goToNextDay = () => {
        setSelectedDate(addDays(selectedDate, 1))
    }

    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

    return (
        <div className="space-y-6">
            {/* Date Navigation */}
            <Card className="border-0 shadow-lg">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={goToPreviousDay}
                            disabled={isToday}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="min-w-[240px] justify-center font-medium"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: localeId })}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="center">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => date && setSelectedDate(date)}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={goToNextDay}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Time Slot Categories Info */}
            {timeSlots.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                    {timeSlots.map(slot => (
                        <div key={slot.id} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            {getCategoryIcon(slot.name)}
                            <span>{slot.name}: {slot.startTime} - {slot.endTime}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-emerald-100 dark:bg-emerald-900 border border-emerald-300" />
                    <span className="text-gray-600 dark:text-gray-400">Tersedia</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-red-100 dark:bg-red-900 border border-red-300" />
                    <span className="text-gray-600 dark:text-gray-400">Terisi</span>
                </div>
            </div>

            {/* Schedule Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
            ) : fields.length === 0 ? (
                <div className="text-center py-12">
                    <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Belum ada lapangan tersedia</p>
                </div>
            ) : timeSlots.length === 0 ? (
                <div className="text-center py-12">
                    <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Belum ada kategori waktu yang tersedia</p>
                    <p className="text-sm text-gray-400">Hubungi admin untuk informasi lebih lanjut</p>
                </div>
            ) : (
                <TooltipProvider>
                    <div className="space-y-4">
                        {fields.map((field) => {
                            const bookedSlots = bookedSlotsMap[field.id] || []
                            const bookedSlotTimes = bookedSlots.map(s => s.slot)
                            const availableCount = allHours.length - bookedSlots.filter(s => allHours.includes(s.slot)).length

                            // Create a map for quick lookup
                            const slotDetailsMap = new Map<string, SlotDetail>()
                            bookedSlots.forEach(s => slotDetailsMap.set(s.slot, s))

                            return (
                                <Card key={field.id} className="border-0 shadow-lg overflow-hidden">
                                    <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <MapPin className="w-5 h-5" />
                                                {field.name}
                                            </CardTitle>
                                            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                                                {availableCount} slot tersedia
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="space-y-3">
                                            {timeSlots.map((category) => {
                                                const hours = generateHoursFromSlot(category.startTime, category.endTime)

                                                return (
                                                    <div key={category.id}>
                                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
                                                            {getCategoryIcon(category.name)}
                                                            <span>{category.name}</span>
                                                        </div>
                                                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                                                            {hours.map((slot) => {
                                                                const slotDetail = slotDetailsMap.get(slot)
                                                                const isBooked = !!slotDetail

                                                                if (isBooked) {
                                                                    return (
                                                                        <Tooltip key={slot}>
                                                                            <TooltipTrigger asChild>
                                                                                <div
                                                                                    className={cn(
                                                                                        'py-2 px-1 text-center text-xs font-medium rounded transition-colors cursor-pointer',
                                                                                        slotDetail.status === 'PENDING'
                                                                                            ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
                                                                                            : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                                                                                    )}
                                                                                >
                                                                                    <div className="flex flex-col items-center">
                                                                                        <span>{slot}</span>
                                                                                        <User className="w-3 h-3 mt-0.5" />
                                                                                    </div>
                                                                                </div>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <div className="text-sm">
                                                                                    <p className="font-semibold">{slotDetail.customerName}</p>
                                                                                    <p className="text-xs text-gray-400">
                                                                                        {slotDetail.status === 'PENDING' ? 'Menunggu Konfirmasi' : 'Dikonfirmasi'}
                                                                                    </p>
                                                                                </div>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    )
                                                                }

                                                                return (
                                                                    <div
                                                                        key={slot}
                                                                        className="py-2 px-1 text-center text-xs font-medium rounded transition-colors bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                                                        title="Tersedia"
                                                                    >
                                                                        {slot}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {availableCount > 0 && (
                                            <div className="mt-4 text-center">
                                                <Link href={`/book?field=${field.id}`}>
                                                    <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                                                        Booking {field.name}
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </TooltipProvider>
            )}
        </div>
    )
}
