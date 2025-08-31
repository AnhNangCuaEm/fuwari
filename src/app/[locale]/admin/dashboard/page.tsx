
import { requireAdmin } from "@/lib/auth-utils"
import Link from "next/link"

export default async function AdminDashboard() {
    const adminUser = await requireAdmin()

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    Admin Dashboard
                </h1>
                <Link href="/" className="text-2xl">
                    <button className="btn">
                        Back to Home
                    </button>
                </Link>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            Welcome <strong>{adminUser.name}</strong> to the admin dashboard!
                        </p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">User</h3>
                    <p className="text-2xl font-bold">Management</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">Content</h3>
                    <p className="text-2xl font-bold">Management</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">Settings</h3>
                    <p className="text-2xl font-bold">System</p>
                </div>
            </div>
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Current Admin Info
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                    <p><strong>Email:</strong> {adminUser.email}</p>
                    <p><strong>Role:</strong> {adminUser.role}</p>
                    <p><strong>ID:</strong> {adminUser.id}</p>
                </div>
            </div>
        </div>
    );
}
