'use client'

import { useState, useEffect, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { createPublicBooking } from '@/actions/bookings'
import { getBookedSlots } from '@/actions/bookings'
import { formatCurrency } from '@/lib/constants'
import type { Field } from '@/types'
import type { TimeSlot } from '@/generated/prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIcon, Loader2, CheckCircle, MapPin, Clock, User, Phone, Sunrise, Sun, Sunset } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PublicBookingFormProps {
    fields: Field[]
    timeSlots: TimeSlot[]
    preselectedFieldId?: string
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

export function PublicBookingForm({ fields, timeSlots, preselectedFieldId }: PublicBookingFormProps) {
    const router = useRouter()
    const [state, formAction, isPending] = useActionState(createPublicBooking, null)

    const [selectedField, setSelectedField] = useState<string>(preselectedFieldId || '')
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [selectedStartTime, setSelectedStartTime] = useState<string>('')
    const [selectedEndTime, setSelectedEndTime] = useState<string>('')
    const [bookedSlots, setBookedSlots] = useState<string[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)

    const allHours = getAllHours(timeSlots)

    const currentField = fields.find(f => f.id === selectedField)

    // Load booked slots when field or date changes
    useEffect(() => {
        async function loadBookedSlots() {
            if (selectedField && selectedDate) {
                setLoadingSlots(true)
                setSelectedStartTime('')
                setSelectedEndTime('')
                try {
                    const slots = await getBookedSlots(selectedField, selectedDate)
                    setBookedSlots(slots)
                } catch (error) {
                    console.error('Failed to load booked slots:', error)
                    setBookedSlots([])
                } finally {
                    setLoadingSlots(false)
                }
            }
        }
        loadBookedSlots()
    }, [selectedField, selectedDate])

    // Redirect on success
    useEffect(() => {
        if (state?.success) {
            router.push(`/confirmation?id=${state.data.id}`)
        }
    }, [state, router])

    // Select start time
    const selectStartTime = (slot: string) => {
        if (bookedSlots.includes(slot)) return
        setSelectedStartTime(slot)
        setSelectedEndTime('')
    }

    // Get valid end times based on start time
    const getValidEndTimes = (): string[] => {
        if (!selectedStartTime) return []

        const startIndex = allHours.indexOf(selectedStartTime)
        if (startIndex === -1) return []

        const validEndTimes: string[] = []

        // Find consecutive available slots
        for (let i = startIndex; i < allHours.length; i++) {
            const currentSlot = allHours[i]

            // If this slot is booked and it's not the start slot, stop
            if (bookedSlots.includes(currentSlot) && i > startIndex) break

            // Add end time (next hour)
            const [hour] = currentSlot.split(':').map(Number)
            const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`
            validEndTimes.push(endTime)
        }

        return validEndTimes
    }

    const calculatePrice = () => {
        if (!currentField || !selectedStartTime || !selectedEndTime) return 0

        const [startHour] = selectedStartTime.split(':').map(Number)
        const [endHour] = selectedEndTime.split(':').map(Number)
        const duration = endHour - startHour

        if (duration <= 0) return 0
        return currentField.pricePerHour * duration
    }

    const getDuration = () => {
        if (!selectedStartTime || !selectedEndTime) return 0
        const [startHour] = selectedStartTime.split(':').map(Number)
        const [endHour] = selectedEndTime.split(':').map(Number)
        return endHour - startHour
    }


    return (
        <form action={formAction}>
            <div className="space-y-6">
                {/* Step 1: Select Field */}
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                1
                            </div>
                            Pilih Lapangan
                        </CardTitle>
                        <CardDescription>Pilih lapangan yang ingin Anda booking</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <input type="hidden" name="fieldId" value={selectedField} />
                        <div className="grid gap-3">
                            {fields.map((field) => (
                                <div
                                    key={field.id}
                                    onClick={() => setSelectedField(field.id)}
                                    className={cn(
                                        'p-4 rounded-xl border-2 cursor-pointer transition-all',
                                        selectedField === field.id
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                                                <MapPin className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{field.name}</p>
                                                <p className="text-sm text-gray-500">{field.description || 'Lapangan futsal'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-emerald-600">{formatCurrency(field.pricePerHour)}</p>
                                            <p className="text-xs text-gray-500">per jam</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Step 2: Select Date */}
                <Card className={cn('border-0 shadow-lg transition-opacity', !selectedField && 'opacity-50 pointer-events-none')}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                2
                            </div>
                            Pilih Tanggal
                        </CardTitle>
                        <CardDescription>Pilih tanggal bermain</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <input type="hidden" name="date" value={selectedDate?.toISOString() || ''} />
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal h-12',
                                        !selectedDate && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? (
                                        format(selectedDate, 'EEEE, d MMMM yyyy', { locale: localeId })
                                    ) : (
                                        'Pilih tanggal...'
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </CardContent>
                </Card>

                {/* Step 3: Select Time Slots */}
                <Card className={cn('border-0 shadow-lg transition-opacity', (!selectedField || !selectedDate) && 'opacity-50 pointer-events-none')}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                3
                            </div>
                            Pilih Jam
                        </CardTitle>
                        <CardDescription>Pilih jam mulai, lalu pilih sampai jam berapa</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <input type="hidden" name="startTime" value={selectedStartTime} />
                        <input type="hidden" name="endTime" value={selectedEndTime} />

                        {loadingSlots ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                            </div>
                        ) : timeSlots.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>Belum ada kategori waktu yang tersedia</p>
                                <p className="text-sm">Hubungi admin untuk informasi lebih lanjut</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Start Time Selection */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Jam Mulai</Label>
                                    <div className="space-y-4">
                                        {timeSlots.map((category) => {
                                            const hours = generateHoursFromSlot(category.startTime, category.endTime)

                                            return (
                                                <div key={category.id} className="space-y-2">
                                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                                        {getCategoryIcon(category.name)}
                                                        <span>{category.name}</span>
                                                        <span className="text-gray-400">({category.startTime} - {category.endTime})</span>
                                                    </div>
                                                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                                        {hours.map((slot) => {
                                                            const isBooked = bookedSlots.includes(slot)
                                                            const isSelected = selectedStartTime === slot

                                                            return (
                                                                <button
                                                                    key={slot}
                                                                    type="button"
                                                                    onClick={() => selectStartTime(slot)}
                                                                    disabled={isBooked}
                                                                    className={cn(
                                                                        'py-2 px-1 rounded-lg text-xs font-medium transition-all border',
                                                                        isBooked && 'bg-red-100 text-red-400 cursor-not-allowed line-through border-red-200',
                                                                        isSelected && !isBooked && 'bg-emerald-500 text-white shadow-lg border-emerald-500',
                                                                        !isBooked && !isSelected && 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-gray-200 dark:border-gray-700'
                                                                    )}
                                                                >
                                                                    {slot}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* End Time Selection */}
                                {selectedStartTime && (
                                    <div className="space-y-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                        <Label className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                            Sampai Jam (Mulai: {selectedStartTime})
                                        </Label>
                                        <Select value={selectedEndTime} onValueChange={setSelectedEndTime}>
                                            <SelectTrigger className="w-full bg-white dark:bg-gray-800">
                                                <SelectValue placeholder="Pilih jam selesai" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getValidEndTimes().map((time) => (
                                                    <SelectItem key={time} value={time}>
                                                        {time} ({parseInt(time.split(':')[0]) - parseInt(selectedStartTime.split(':')[0])} jam)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Legend */}
                                <div className="flex items-center gap-4 text-sm pt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-emerald-500" />
                                        <span className="text-gray-600 dark:text-gray-400">Dipilih</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-white border border-gray-200" />
                                        <span className="text-gray-600 dark:text-gray-400">Tersedia</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-red-100" />
                                        <span className="text-gray-600 dark:text-gray-400">Terisi</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Step 4: Customer Info */}
                <Card className={cn('border-0 shadow-lg transition-opacity', !selectedEndTime && 'opacity-50 pointer-events-none')}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                4
                            </div>
                            Data Pemesan
                        </CardTitle>
                        <CardDescription>Isi data diri untuk konfirmasi booking</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="customerName" className="flex items-center gap-2">
                                <User className="w-4 h-4" /> Nama Lengkap
                            </Label>
                            <Input
                                id="customerName"
                                name="customerName"
                                placeholder="Masukkan nama lengkap"
                                required
                                className="h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customerPhone" className="flex items-center gap-2">
                                <Phone className="w-4 h-4" /> Nomor WhatsApp
                            </Label>
                            <Input
                                id="customerPhone"
                                name="customerPhone"
                                placeholder="08xxxxxxxxxx"
                                required
                                className="h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Catatan (opsional)</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                placeholder="Catatan tambahan..."
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Summary & Submit */}
                {selectedEndTime && currentField && (
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Ringkasan Booking</h3>
                                    <div className="space-y-1 text-white/90">
                                        <p className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            {currentField.name}
                                        </p>
                                        {selectedDate && (
                                            <p className="flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4" />
                                                {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: localeId })}
                                            </p>
                                        )}
                                        <p className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            {selectedStartTime} - {selectedEndTime} ({getDuration()} jam)
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-white/80">Total Harga</p>
                                    <p className="text-3xl font-bold">{formatCurrency(calculatePrice())}</p>
                                </div>
                            </div>

                            {state?.success === false && (
                                <div className="mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-white">
                                    {state.error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isPending || !selectedEndTime}
                                className="w-full mt-6 bg-white text-emerald-700 hover:bg-gray-100 h-14 text-lg font-semibold"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Konfirmasi Booking
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </form>
    )
}
