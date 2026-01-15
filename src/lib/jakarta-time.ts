const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000
const MS_PER_DAY = 24 * 60 * 60 * 1000

const pad2 = (value: number) => value.toString().padStart(2, '0')

type JakartaParts = {
    year: number
    month: number
    day: number
    hour: number
    minute: number
    second: number
    millisecond: number
    weekday: number
}

const getJakartaParts = (date: Date): JakartaParts => {
    const shifted = new Date(date.getTime() + JAKARTA_OFFSET_MS)

    return {
        year: shifted.getUTCFullYear(),
        month: shifted.getUTCMonth() + 1,
        day: shifted.getUTCDate(),
        hour: shifted.getUTCHours(),
        minute: shifted.getUTCMinutes(),
        second: shifted.getUTCSeconds(),
        millisecond: shifted.getUTCMilliseconds(),
        weekday: shifted.getUTCDay(),
    }
}

const addDaysUtc = (date: Date, days: number) => new Date(date.getTime() + days * MS_PER_DAY)

export const jakartaDateUtc = (date: Date): Date => {
    const { year, month, day } = getJakartaParts(date)
    return new Date(Date.UTC(year, month - 1, day))
}

export const startOfJakartaDayUtc = (date: Date): Date => {
    const { year, month, day } = getJakartaParts(date)
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0) - JAKARTA_OFFSET_MS)
}

export const endOfJakartaDayUtc = (date: Date): Date => {
    const { year, month, day } = getJakartaParts(date)
    return new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999) - JAKARTA_OFFSET_MS)
}

export const startOfJakartaWeekDateUtc = (date: Date, weekStartsOn = 1): Date => {
    const shifted = new Date(date.getTime() + JAKARTA_OFFSET_MS)
    const diff = (shifted.getUTCDay() - weekStartsOn + 7) % 7
    return new Date(Date.UTC(
        shifted.getUTCFullYear(),
        shifted.getUTCMonth(),
        shifted.getUTCDate() - diff
    ))
}

export const endOfJakartaWeekDateUtc = (date: Date, weekStartsOn = 1): Date => {
    const start = startOfJakartaWeekDateUtc(date, weekStartsOn)
    return addDaysUtc(start, 6)
}

export const startOfJakartaMonthDateUtc = (date: Date): Date => {
    const { year, month } = getJakartaParts(date)
    return new Date(Date.UTC(year, month - 1, 1))
}

export const endOfJakartaMonthDateUtc = (date: Date): Date => {
    const { year, month } = getJakartaParts(date)
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
    return new Date(Date.UTC(year, month - 1, lastDay))
}

export const startOfJakartaYearDateUtc = (date: Date): Date => {
    const { year } = getJakartaParts(date)
    return new Date(Date.UTC(year, 0, 1))
}

export const endOfJakartaYearDateUtc = (date: Date): Date => {
    const { year } = getJakartaParts(date)
    return new Date(Date.UTC(year, 11, 31))
}

export const combineJakartaDateTime = (date: Date, time: string): Date => {
    const { year, month, day } = getJakartaParts(date)
    const [hour, minute] = time.split(':').map(Number)
    return new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0) - JAKARTA_OFFSET_MS)
}

export const getJakartaDateKey = (date: Date): string => {
    const { year, month, day } = getJakartaParts(date)
    return `${year}-${pad2(month)}-${pad2(day)}`
}

export const getJakartaTimeString = (date: Date): string => {
    const { hour, minute } = getJakartaParts(date)
    return `${pad2(hour)}:${pad2(minute)}`
}
