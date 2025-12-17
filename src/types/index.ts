import type {
    User,
    Field,
    Booking,
    Transaction,
    Expense,
} from '@/generated/prisma/client'
import type {
    Role,
    BookingStatus,
    PaymentStatus,
    PaymentMethod
} from '@/generated/prisma/enums'

// Re-export Prisma types
export type {
    User,
    Field,
    Booking,
    Transaction,
    Expense,
    Role,
    BookingStatus,
    PaymentStatus,
    PaymentMethod
}

// Extended types with relations
export type BookingWithField = Booking & {
    field: Field
}

export type BookingWithTransaction = Booking & {
    transaction: Transaction | null
}

export type BookingFull = Booking & {
    field: Field
    transaction: Transaction | null
}

export type TransactionWithBooking = Transaction & {
    booking: BookingWithField
}

// Form types
export type CreateFieldInput = {
    name: string
    description?: string
    pricePerHour: number
    isActive?: boolean
}

export type UpdateFieldInput = Partial<CreateFieldInput>

export type CreateBookingInput = {
    fieldId: string
    customerName: string
    customerPhone?: string
    date: Date
    startTime: string
    endTime: string
    notes?: string
}

export type CreateTransactionInput = {
    bookingId: string
    amount: number
    paymentMethod: PaymentMethod
    notes?: string
}

export type CreateExpenseInput = {
    date: Date
    amount: number
    description: string
    category?: string
}

// Session/Auth types
export type SessionUser = {
    id: string
    email: string
    name: string
    role: Role
}

export type Session = {
    user: SessionUser
    expiresAt: Date
}

// API response types
export type ActionResult<T = void> =
    | { success: true; data: T }
    | { success: false; error: string }

// Date range filter
export type DateRange = {
    from: Date
    to: Date
}

// Financial summary
export type FinancialSummary = {
    totalIncome: number
    totalExpense: number
    profit: number
    transactionCount: number
}

// Dashboard stats
export type DashboardStats = {
    todayBookings: number
    todayIncome: number
    pendingBookings: number
    activeFields: number
}

// Time slot
export type TimeSlot = {
    time: string
    available: boolean
}
