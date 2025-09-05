// import { requireAdmin } from "@/lib/auth-utils"

export default async function AdminSettings() {
    // const adminUser = await requireAdmin()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    System Settings
                </h1>
                <p className="text-gray-600 mt-2">
                    Configure system-wide settings and preferences.
                </p>
            </div>

            {/* Settings Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Settings */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        General Settings
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Site Name
                            </label>
                            <input 
                                type="text" 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                placeholder="Enter site name"
                                defaultValue="Fuwari Admin"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Site Description
                            </label>
                            <textarea 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Enter site description"
                                defaultValue="Admin panel for managing the Fuwari application"
                            />
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Security Settings
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Two-Factor Authentication
                                </label>
                                <p className="text-xs text-gray-500">Enable 2FA for enhanced security</p>
                            </div>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600">
                                Enable
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Session Timeout
                                </label>
                                <p className="text-xs text-gray-500">Auto-logout after inactivity</p>
                            </div>
                            <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                                <option>30 minutes</option>
                                <option>1 hour</option>
                                <option>2 hours</option>
                                <option>Never</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Email Settings */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Email Settings
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                SMTP Server
                            </label>
                            <input 
                                type="text" 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                placeholder="smtp.example.com"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Port
                                </label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    placeholder="587"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Encryption
                                </label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option>TLS</option>
                                    <option>SSL</option>
                                    <option>None</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Maintenance Mode */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Maintenance Mode
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Enable Maintenance Mode
                                </label>
                                <p className="text-xs text-gray-500">Show maintenance page to users</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Maintenance Message
                            </label>
                            <textarea 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="We are currently performing maintenance. Please check back later."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-end space-x-4">
                    <button className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                        Reset
                    </button>
                    <button className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}
