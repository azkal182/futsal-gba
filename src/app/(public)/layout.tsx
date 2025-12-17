import Link from 'next/link'
import { Calendar, MapPin, Phone, Clock } from 'lucide-react'

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                Futsal Booking
                            </span>
                        </Link>
                        <nav className="hidden md:flex items-center gap-6">
                            <Link
                                href="/"
                                className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 transition-colors"
                            >
                                Beranda
                            </Link>
                            <Link
                                href="/schedule"
                                className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 transition-colors"
                            >
                                Jadwal
                            </Link>
                            <Link
                                href="/book"
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg"
                            >
                                Booking Sekarang
                            </Link>
                        </nav>
                        {/* Mobile menu button */}
                        <Link
                            href="/book"
                            className="md:hidden px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium text-sm"
                        >
                            Booking
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xl font-bold">Futsal Booking</span>
                            </div>
                            <p className="text-gray-400">
                                Sistem booking lapangan futsal online. Mudah, cepat, dan terpercaya.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-4">Jam Operasional</h3>
                            <div className="flex items-center gap-2 text-gray-400">
                                <Clock className="w-4 h-4" />
                                <span>Setiap Hari: 08:00 - 22:00</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-4">Kontak</h3>
                            <div className="space-y-2 text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    <span>0812-3456-7890</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>Jl. Contoh No. 123, Kota</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
                        <p>&copy; {new Date().getFullYear()} Futsal Booking. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
