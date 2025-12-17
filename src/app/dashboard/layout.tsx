import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Toaster } from '@/components/ui/sonner'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
            <AppSidebar />

            <main className="flex-1 flex flex-col min-w-0">
                {/* Header - fixed at top */}
                <header className="flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between px-6 py-4 lg:px-8">
                        <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}
                        <div className="flex-1 lg:flex-none" />

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {user.role === 'OWNER' ? 'Owner' : 'Admin'}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-medium shadow-lg">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content - scrollable */}
                <div className="flex-1 overflow-auto p-6 lg:p-8">
                    {children}
                </div>
            </main>

            <Toaster position="top-right" richColors />
        </div>
    )
}
