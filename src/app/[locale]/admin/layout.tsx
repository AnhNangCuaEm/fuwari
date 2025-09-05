import { requireAdmin } from "@/lib/auth-utils"
import AdminSidebar from "@/components/layout/AdminSidebar"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    await requireAdmin()

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <AdminSidebar />
            
            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
