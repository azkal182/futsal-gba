import Link from 'next/link'
import { getPublicFields } from '@/actions/fields'
import { formatCurrency } from '@/lib/constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, ArrowRight, CheckCircle } from 'lucide-react'

export default async function PublicHomePage() {
    const activeFields = await getPublicFields()

    return (
        <div>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white py-20 md:py-32">
                <div className="absolute inset-0 bg-black/20" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Booking Lapangan Futsal
                            <span className="text-emerald-300"> Jadi Mudah</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 mb-8">
                            Pesan lapangan futsal favoritmu secara online. Pilih waktu, bayar, dan main!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/book">
                                <Button size="lg" className="w-full sm:w-auto bg-white text-emerald-700 hover:bg-gray-100 shadow-xl text-lg px-8">
                                    <Calendar className="w-5 h-5 mr-2" />
                                    Booking Sekarang
                                </Button>
                            </Link>
                            <Link href="/schedule">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10 text-lg px-8">
                                    Lihat Jadwal
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Decorative shapes */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gray-50 dark:bg-gray-950" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }} />
            </section>

            {/* Features */}
            <section className="py-16 bg-gray-50 dark:bg-gray-950">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Booking Online</h3>
                            <p className="text-gray-600 dark:text-gray-400">Pesan kapan saja, di mana saja melalui website</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Real-time</h3>
                            <p className="text-gray-600 dark:text-gray-400">Lihat ketersediaan jadwal secara langsung</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Konfirmasi Cepat</h3>
                            <p className="text-gray-600 dark:text-gray-400">Booking dikonfirmasi oleh admin dengan cepat</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Field List */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Pilihan Lapangan
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            Tersedia berbagai lapangan dengan fasilitas terbaik
                        </p>
                    </div>

                    {activeFields.length === 0 ? (
                        <div className="text-center py-12">
                            <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">Belum ada lapangan tersedia</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {activeFields.map((field) => (
                                <Card key={field.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                                    <div className="h-48 bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                                        <MapPin className="w-20 h-20 text-white/50" />
                                    </div>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xl">{field.name}</CardTitle>
                                            <Badge className="bg-emerald-100 text-emerald-800">Tersedia</Badge>
                                        </div>
                                        <CardDescription>{field.description || 'Lapangan futsal berkualitas'}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-2xl font-bold text-emerald-600">
                                                    {formatCurrency(field.pricePerHour)}
                                                </p>
                                                <p className="text-sm text-gray-500">per jam</p>
                                            </div>
                                            <Link href={`/book?field=${field.id}`}>
                                                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                                                    Booking <ArrowRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Siap Main Futsal?
                    </h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Jangan sampai kehabisan slot! Booking sekarang dan nikmati bermain futsal bersama teman-teman.
                    </p>
                    <Link href="/book">
                        <Button size="lg" className="bg-white text-emerald-700 hover:bg-gray-100 shadow-xl text-lg px-8">
                            <Calendar className="w-5 h-5 mr-2" />
                            Booking Sekarang
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    )
}
