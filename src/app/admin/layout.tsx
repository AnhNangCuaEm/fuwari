import { requireAdmin } from "@/lib/auth-utils"
import { redirect } from "next/navigation"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    let adminUser

    try {
        adminUser = await requireAdmin()
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Authentication required') {
                redirect('/auth/signin')
            } else if (error.message === 'Admin access required') {
                redirect('/unauthorized')
            }
        }
        redirect('/auth/signin')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-gray-800">
                            Admin Panel
                        </h1>
                        <div className="text-sm text-gray-600">
                            Hi <strong>{adminUser.name}</strong> (Admin)
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 py-6">
                {children}
            </div>
        </div>
    )
}
