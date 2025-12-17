import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import type { DateRange } from '@/types'

// Preset date ranges
export function getPresetDateRange(preset: 'today' | 'week' | 'month' | 'year'): DateRange {
    const now = new Date()

    switch (preset) {
        case 'today':
            return { from: startOfDay(now), to: endOfDay(now) }
        case 'week':
            return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) }
        case 'month':
            return { from: startOfMonth(now), to: endOfMonth(now) }
        case 'year':
            return { from: new Date(now.getFullYear(), 0, 1), to: new Date(now.getFullYear(), 11, 31) }
        default:
            return { from: startOfMonth(now), to: endOfMonth(now) }
    }
}
