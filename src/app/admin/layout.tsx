import { requireAdmin } from "@/lib/auth-utils"
import AdminMenu from "@/components/layout/AdminMenu"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    await requireAdmin()

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-gray-800">
                            Admin Panel
                        </h1>
                        <AdminMenu />
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 py-6">
                {children}
            </div>
        </div>
    )
}
