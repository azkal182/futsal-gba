// Operating hours configuration
export const OPERATING_HOURS = {
    start: '08:00',
    end: '22:00',
} as const

// Time slot duration in minutes
export const SLOT_DURATION_MINUTES = 60

// Generate time slots array
export const TIME_SLOTS = (() => {
    const slots: string[] = []
    const [startHour] = OPERATING_HOURS.start.split(':').map(Number)
    const [endHour] = OPERATING_HOURS.end.split(':').map(Number)

    for (let hour = startHour; hour < endHour; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`)
    }

    return slots
})()

// Booking status labels in Indonesian
export const BOOKING_STATUS_LABELS = {
    PENDING: 'Menunggu',
    CONFIRMED: 'Dikonfirmasi',
    CANCELLED: 'Dibatalkan',
    COMPLETED: 'Selesai',
} as const

// Booking status colors for badges
export const BOOKING_STATUS_COLORS = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
} as const

// Payment status labels
export const PAYMENT_STATUS_LABELS = {
    UNPAID: 'Belum Bayar',
    PAID: 'Lunas',
} as const

// Payment status colors
export const PAYMENT_STATUS_COLORS = {
    UNPAID: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    PAID: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
} as const

// Payment method labels
export const PAYMENT_METHOD_LABELS = {
    CASH: 'Tunai',
    TRANSFER: 'Transfer Bank',
    EWALLET: 'E-Wallet',
} as const

// Role labels
export const ROLE_LABELS = {
    ADMIN: 'Admin',
    OWNER: 'Owner',
} as const

// Currency formatter for IDR
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

// Date formatter
export const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(date))
}

// Short date formatter
export const formatShortDate = (date: Date): string => {
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(date))
}

// Navigation items for sidebar
export const NAV_ITEMS = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: 'LayoutDashboard',
    },
    {
        title: 'Lapangan',
        href: '/dashboard/fields',
        icon: 'MapPin',
    },
    {
        title: 'Booking',
        href: '/dashboard/bookings',
        icon: 'Calendar',
    },
    {
        title: 'Transaksi',
        href: '/dashboard/transactions',
        icon: 'CreditCard',
    },
    {
        title: 'Pengeluaran',
        href: '/dashboard/expenses',
        icon: 'Receipt',
    },
    {
        title: 'Laporan',
        href: '/dashboard/reports',
        icon: 'BarChart3',
    },
    {
        title: 'Pengaturan',
        href: '/dashboard/settings/timeslots',
        icon: 'Settings',
    },
] as const

// Session cookie name
export const SESSION_COOKIE_NAME = 'futsal-session'

// Session duration in days
export const SESSION_DURATION_DAYS = 7
