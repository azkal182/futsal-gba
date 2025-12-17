'use client'

import { useState, useEffect, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { createBooking, getAvailableSlots } from '@/actions/bookings'
import { formatCurrency, TIME_SLOTS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, Loader2, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Field, TimeSlot } from '@/types'

interface NewBookingFormProps {
    fields: Field[]
}

export function NewBookingForm({ fields }: NewBookingFormProps) {
    const router = useRouter()
    const [selectedField, setSelectedField] = useState<Field | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [selectedStartTime, setSelectedStartTime] = useState<string>('')
    const [selectedEndTime, setSelectedEndTime] = useState<string>('')
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
    const [isLoadingSlots, setIsLoadingSlots] = useState(false)
    const [state, formAction, isPending] = useActionState(createBooking, null)

    // Calculate price
    const calculatePrice = () => {
        if (!selectedField || !selectedStartTime || !selectedEndTime) return 0

        const [startHour] = selectedStartTime.split(':').map(Number)
        const [endHour] = selectedEndTime.split(':').map(Number)
        const duration = endHour - startHour

        if (duration <= 0) return 0
        return selectedField.pricePerHour * duration
    }

    const totalPrice = calculatePrice()
    const duration = selectedStartTime && selectedEndTime
        ? parseInt(selectedEndTime.split(':')[0]) - parseInt(selectedStartTime.split(':')[0])
        : 0

    // Load available slots when field and date change
    useEffect(() => {
        if (selectedField && selectedDate) {
            setIsLoadingSlots(true)
            getAvailableSlots(selectedField.id, selectedDate)
                .then(setAvailableSlots)
                .finally(() => setIsLoadingSlots(false))
        } else {
            setAvailableSlots([])
        }
        setSelectedStartTime('')
        setSelectedEndTime('')
    }, [selectedField, selectedDate])

    // Get valid end times based on start time
    const getValidEndTimes = () => {
        if (!selectedStartTime) return []

        const startIndex = TIME_SLOTS.indexOf(selectedStartTime)
        if (startIndex === -1) return []

        // Find consecutive available slots
        const validEndTimes: string[] = []
        for (let i = startIndex + 1; i < TIME_SLOTS.length; i++) {
            const slot = availableSlots.find((s) => s.time === TIME_SLOTS[i - 1])
            if (!slot?.available && i > startIndex + 1) break

            // Calculate end time (add 1 hour to slot time)
            const [hour] = TIME_SLOTS[i].split(':').map(Number)
            validEndTimes.push(`${hour.toString().padStart(2, '0')}:00`)
        }

        // Add last possible slot
        const lastSlotIndex = availableSlots.findIndex((s, idx) =>
            idx >= startIndex && !s.available
        )

        if (lastSlotIndex === -1) {
            validEndTimes.push('22:00')
        }

        return [...new Set(validEndTimes)]
    }

    const handleSubmit = async (formData: FormData) => {
        if (!selectedField || !selectedDate || !selectedStartTime || !selectedEndTime) {
            toast.error('Lengkapi semua field yang diperlukan')
            return
        }

        formData.set('fieldId', selectedField.id)
        formData.set('date', format(selectedDate, 'yyyy-MM-dd'))
        formData.set('startTime', selectedStartTime)
        formData.set('endTime', selectedEndTime)

        const result = await createBooking(null, formData)

        if (result.success) {
            toast.success('Booking berhasil dibuat')
            router.push('/dashboard/bookings')
        } else {
            toast.error(result.error)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            {/* Field Selection */}
            <div className="space-y-2">
                <Label>Lapangan</Label>
                <Select
                    value={selectedField?.id ?? ''}
                    onValueChange={(value) => {
                        const field = fields.find((f) => f.id === value)
                        setSelectedField(field ?? null)
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih lapangan" />
                    </SelectTrigger>
                    <SelectContent>
                        {fields.map((field) => (
                            <SelectItem key={field.id} value={field.id}>
                                {field.name} - {formatCurrency(field.pricePerHour)}/jam
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
                <Label>Tanggal</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                'w-full justify-start text-left font-normal',
                                !selectedDate && 'text-muted-foreground'
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate
                                ? format(selectedDate, 'EEEE, d MMMM yyyy', { locale: localeId })
                                : 'Pilih tanggal'}
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
            </div>

            {/* Time Selection */}
            {selectedField && selectedDate && (
                <div className="space-y-4">
                    <Label>Waktu</Label>

                    {isLoadingSlots ? (
                        <div className="flex items-center gap-2 text-gray-500">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Memuat slot waktu...
                        </div>
                    ) : (
                        <>
                            {/* Time Slot Grid */}
                            <div className="grid grid-cols-7 gap-2">
                                {availableSlots.map((slot) => (
                                    <button
                                        key={slot.time}
                                        type="button"
                                        onClick={() => {
                                            if (slot.available) {
                                                setSelectedStartTime(slot.time)
                                                setSelectedEndTime('')
                                            }
                                        }}
                                        className={cn(
                                            'p-2 text-xs rounded-lg border transition-all',
                                            slot.available
                                                ? selectedStartTime === slot.time
                                                    ? 'bg-emerald-500 text-white border-emerald-500'
                                                    : 'hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                                        )}
                                        disabled={!slot.available}
                                    >
                                        {slot.time}
                                    </button>
                                ))}
                            </div>

                            {/* End Time Selection */}
                            {selectedStartTime && (
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600">Sampai Jam</Label>
                                    <Select
                                        value={selectedEndTime}
                                        onValueChange={setSelectedEndTime}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih jam selesai" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getValidEndTimes().map((time) => (
                                                <SelectItem key={time} value={time}>
                                                    {time}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Customer Info */}
            <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                    <Label htmlFor="customerName">Nama Penyewa</Label>
                    <Input
                        id="customerName"
                        name="customerName"
                        placeholder="Masukkan nama penyewa"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="customerPhone">No. Telepon (Opsional)</Label>
                    <Input
                        id="customerPhone"
                        name="customerPhone"
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="notes">Catatan (Opsional)</Label>
                    <Textarea
                        id="notes"
                        name="notes"
                        placeholder="Catatan tambahan..."
                        rows={3}
                    />
                </div>
            </div>

            {/* Price Summary */}
            {totalPrice > 0 && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Harga</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(totalPrice)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Durasi</p>
                            <p className="text-lg font-medium flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {duration} jam
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {state?.success === false && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                    {state.error}
                </div>
            )}

            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                >
                    Batal
                </Button>
                <Button
                    type="submit"
                    disabled={isPending || !totalPrice}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        'Buat Booking'
                    )}
                </Button>
            </div>
        </form>
    )
}
