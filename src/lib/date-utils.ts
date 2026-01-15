import {
    jakartaDateUtc,
    startOfJakartaWeekDateUtc,
    endOfJakartaWeekDateUtc,
    startOfJakartaMonthDateUtc,
    endOfJakartaMonthDateUtc,
    startOfJakartaYearDateUtc,
    endOfJakartaYearDateUtc,
} from '@/lib/jakarta-time'
import type { DateRange } from '@/types'

// Preset date ranges
export function getPresetDateRange(preset: 'today' | 'week' | 'month' | 'year'): DateRange {
    const now = new Date()

    switch (preset) {
        case 'today':
            return { from: jakartaDateUtc(now), to: jakartaDateUtc(now) }
        case 'week':
            return {
                from: startOfJakartaWeekDateUtc(now, 1),
                to: endOfJakartaWeekDateUtc(now, 1),
            }
        case 'month':
            return { from: startOfJakartaMonthDateUtc(now), to: endOfJakartaMonthDateUtc(now) }
        case 'year':
            return { from: startOfJakartaYearDateUtc(now), to: endOfJakartaYearDateUtc(now) }
        default:
            return { from: startOfJakartaMonthDateUtc(now), to: endOfJakartaMonthDateUtc(now) }
    }
}
