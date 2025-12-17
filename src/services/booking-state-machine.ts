import type { BookingStatus } from '@/generated/prisma/enums'

/**
 * Booking Status State Machine
 *
 * Valid transitions:
 * - PENDING → CONFIRMED (confirm booking)
 * - PENDING → CANCELLED (cancel or auto-expire)
 * - CONFIRMED → COMPLETED (mark as completed after use)
 * - CONFIRMED → CANCELLED (cancel confirmed booking)
 * - CANCELLED → (terminal state, no transitions)
 * - COMPLETED → (terminal state, no transitions)
 */

type StatusTransition = {
    from: BookingStatus
    to: BookingStatus
    action: string
}

const VALID_TRANSITIONS: StatusTransition[] = [
    { from: 'PENDING', to: 'CONFIRMED', action: 'confirm' },
    { from: 'PENDING', to: 'CANCELLED', action: 'cancel' },
    { from: 'CONFIRMED', to: 'COMPLETED', action: 'complete' },
    { from: 'CONFIRMED', to: 'CANCELLED', action: 'cancel' },
]

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
    return VALID_TRANSITIONS.some(
        (transition) => transition.from === from && transition.to === to
    )
}

export function getValidNextStatuses(current: BookingStatus): BookingStatus[] {
    return VALID_TRANSITIONS
        .filter((transition) => transition.from === current)
        .map((transition) => transition.to)
}

export function getTransitionAction(from: BookingStatus, to: BookingStatus): string | null {
    const transition = VALID_TRANSITIONS.find(
        (t) => t.from === from && t.to === to
    )
    return transition?.action ?? null
}

export function isTerminalStatus(status: BookingStatus): boolean {
    return status === 'CANCELLED' || status === 'COMPLETED'
}

export function validateStatusTransition(
    from: BookingStatus,
    to: BookingStatus
): { valid: boolean; error?: string } {
    if (from === to) {
        return { valid: false, error: 'Status sudah sama' }
    }

    if (isTerminalStatus(from)) {
        return {
            valid: false,
            error: `Tidak dapat mengubah status dari ${from} karena sudah final`
        }
    }

    if (!canTransition(from, to)) {
        const validOptions = getValidNextStatuses(from)
        return {
            valid: false,
            error: `Transisi dari ${from} ke ${to} tidak valid. Status yang diizinkan: ${validOptions.join(', ')}`
        }
    }

    return { valid: true }
}

// Status display helpers
export const STATUS_ACTIONS: Record<BookingStatus, { label: string; nextActions: { status: BookingStatus; label: string; variant: 'default' | 'destructive' | 'outline' }[] }> = {
    PENDING: {
        label: 'Menunggu Konfirmasi',
        nextActions: [
            { status: 'CONFIRMED', label: 'Konfirmasi', variant: 'default' },
            { status: 'CANCELLED', label: 'Batalkan', variant: 'destructive' },
        ],
    },
    CONFIRMED: {
        label: 'Dikonfirmasi',
        nextActions: [
            { status: 'COMPLETED', label: 'Selesaikan', variant: 'default' },
            { status: 'CANCELLED', label: 'Batalkan', variant: 'destructive' },
        ],
    },
    CANCELLED: {
        label: 'Dibatalkan',
        nextActions: [],
    },
    COMPLETED: {
        label: 'Selesai',
        nextActions: [],
    },
}
