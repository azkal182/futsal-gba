import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import type { Field, Booking, Transaction, Expense } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Starting seed...')

    // Clean existing data
    console.log('🧹 Cleaning existing data...')
    await prisma.expense.deleteMany()
    await prisma.transaction.deleteMany()
    await prisma.booking.deleteMany()
    await prisma.field.deleteMany()
    await prisma.timeSlot.deleteMany()
    await prisma.user.deleteMany()

    // Create users
    console.log('👤 Creating users...')
    const hashedPassword = await bcrypt.hash('password123', 12)

    const owner = await prisma.user.create({
        data: {
            email: 'owner@futsal.com',
            password: hashedPassword,
            name: 'Pemilik Lapangan',
            role: 'OWNER',
        },
    })

    const admin = await prisma.user.create({
        data: {
            email: 'admin@futsal.com',
            password: hashedPassword,
            name: 'Admin Booking',
            role: 'ADMIN',
        },
    })

    console.log(`  ✅ Created owner: ${owner.email}`)
    console.log(`  ✅ Created admin: ${admin.email}`)

    // Create time slots (categories)
    console.log('⏰ Creating time slot categories...')
    const timeSlots = await Promise.all([
        prisma.timeSlot.create({
            data: {
                name: 'Pagi',
                startTime: '06:00',
                endTime: '10:00',
                sortOrder: 1,
                isActive: true,
            },
        }),
        prisma.timeSlot.create({
            data: {
                name: 'Siang',
                startTime: '10:00',
                endTime: '15:00',
                sortOrder: 2,
                isActive: true,
            },
        }),
        prisma.timeSlot.create({
            data: {
                name: 'Sore',
                startTime: '15:00',
                endTime: '22:00',
                sortOrder: 3,
                isActive: true,
            },
        }),
    ])

    timeSlots.forEach((ts) => console.log(`  ✅ Created time slot: ${ts.name} (${ts.startTime} - ${ts.endTime})`))

    // Create fields
    console.log('🏟️ Creating fields...')
    const fields = await Promise.all([
        prisma.field.create({
            data: {
                name: 'Lapangan A',
                description: 'Lapangan utama dengan rumput sintetis premium',
                pricePerHour: 150000,
                isActive: true,
            },
        }),
        prisma.field.create({
            data: {
                name: 'Lapangan B',
                description: 'Lapangan standar dengan rumput sintetis',
                pricePerHour: 120000,
                isActive: true,
            },
        }),
        prisma.field.create({
            data: {
                name: 'Lapangan C',
                description: 'Lapangan indoor dengan AC',
                pricePerHour: 200000,
                isActive: true,
            },
        }),
    ])

    fields.forEach((f) => console.log(`  ✅ Created field: ${f.name} - Rp ${f.pricePerHour.toLocaleString()}/jam`))

    // Create sample bookings for today
    console.log('📅 Creating sample bookings...')
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const bookings = await Promise.all([
        prisma.booking.create({
            data: {
                fieldId: fields[0].id,
                customerName: 'Budi Santoso',
                customerPhone: '081234567890',
                date: today,
                startTime: '09:00',
                endTime: '11:00',
                duration: 2,
                totalPrice: 300000,
                status: 'CONFIRMED',
            },
        }),
        prisma.booking.create({
            data: {
                fieldId: fields[1].id,
                customerName: 'Andi Wijaya',
                customerPhone: '089876543210',
                date: today,
                startTime: '14:00',
                endTime: '16:00',
                duration: 2,
                totalPrice: 240000,
                status: 'PENDING',
            },
        }),
        prisma.booking.create({
            data: {
                fieldId: fields[0].id,
                customerName: 'Citra Dewi',
                customerPhone: '087654321098',
                date: today,
                startTime: '17:00',
                endTime: '19:00',
                duration: 2,
                totalPrice: 300000,
                status: 'CONFIRMED',
            },
        }),
    ])

    bookings.forEach((b) => console.log(`  ✅ Created booking: ${b.customerName} (${b.startTime}-${b.endTime})`))

    // Create transactions for confirmed bookings
    console.log('💳 Creating transactions...')
    const transactions = await Promise.all([
        prisma.transaction.create({
            data: {
                bookingId: bookings[0].id,
                amount: bookings[0].totalPrice,
                paymentMethod: 'CASH',
                paymentStatus: 'PAID',
                paidAt: new Date(),
            },
        }),
        prisma.transaction.create({
            data: {
                bookingId: bookings[2].id,
                amount: bookings[2].totalPrice,
                paymentMethod: 'TRANSFER',
                paymentStatus: 'UNPAID',
            },
        }),
    ])

    transactions.forEach((t) => console.log(`  ✅ Created transaction: Rp ${t.amount.toLocaleString()} (${t.paymentStatus})`))

    // Create sample expenses
    console.log('📝 Creating sample expenses...')
    const expenses = await Promise.all([
        prisma.expense.create({
            data: {
                date: today,
                amount: 500000,
                description: 'Pembayaran listrik bulanan',
                category: 'Utilitas',
            },
        }),
        prisma.expense.create({
            data: {
                date: today,
                amount: 150000,
                description: 'Beli air minum untuk tamu',
                category: 'Operasional',
            },
        }),
        prisma.expense.create({
            data: {
                date: today,
                amount: 300000,
                description: 'Perawatan rumput sintetis',
                category: 'Perawatan',
            },
        }),
    ])

    expenses.forEach((e) => console.log(`  ✅ Created expense: ${e.description} - Rp ${e.amount.toLocaleString()}`))

    console.log('')
    console.log('✨ Seed completed successfully!')
    console.log('')
    console.log('📋 Login credentials:')
    console.log('  Owner: owner@futsal.com / password123')
    console.log('  Admin: admin@futsal.com / password123')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
