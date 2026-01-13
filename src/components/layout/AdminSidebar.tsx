'use client'

import { Link } from "@/i18n/navigation"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { useCurrentUser } from "@/lib/hooks/useAuth"
import { signOut } from "next-auth/react"

// Simple SVG Icons
const ChevronLeftIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
)

const ChevronRightIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
)

const HomeIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
)

const ChartBarIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
)

const UsersIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
)

const DocumentTextIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
)

const CogIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
)

const ArrowRightOnRectangleIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
)

export default function AdminSidebar() {
    const [isExpanded, setIsExpanded] = useState(true)
    const pathname = usePathname()
    const { user } = useCurrentUser()

    const menuItems = [
        {
            name: "Dashboard",
            href: "/admin/dashboard",
            icon: ChartBarIcon,
        },
        {
            name: "User Management",
            href: "/admin/users",
            icon: UsersIcon,
        },
        {
            name: "Content Management",
            href: "/admin/content",
            icon: DocumentTextIcon,
        },
        {
            name: "Settings",
            href: "/admin/settings",
            icon: CogIcon,
        },
    ]

    const signOutAlert = () => {
        if (confirm("Are you sure you want to sign out?")) {
            handleSignOut()
        }
    }

    const backHomeAlert = () => {
        if (confirm("Are you sure you want to go back to the home page?")) {
            window.location.href = "/"
        }
    }

    const handleSignOut = () => {
        signOut({ callbackUrl: '/' })
    }

    const isActiveRoute = (href: string) => {
        return pathname === href || pathname.startsWith(href + '/')
    }

    return (
        <div className={`bg-gray-900 text-white h-screen transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'
            } flex flex-col`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-center gap-16">
                    {isExpanded && (
                        <h2 className="text-xl font-bold">Admin Panel</h2>
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        {isExpanded ? (
                            <ChevronLeftIcon className="w-5 h-5" />
                        ) : (
                            <ChevronRightIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            {/* User Info */}
            {isExpanded && user && (
                <div className="p-4 border-b border-gray-700">
                    <div className="text-sm text-gray-300">Welcome</div>
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-xs text-blue-400 bg-blue-900 px-2 py-1 rounded-full inline-block mt-1">
                        Admin
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {/* Home Link */}
                    <li>
                        <button
                            onClick={backHomeAlert}
                            className={`w-full flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors ${pathname === '/' ? 'bg-gray-700 text-blue-400' : ''
                                } ${isExpanded ? 'justify-start' : 'justify-center'}`}
                        >
                            <HomeIcon className="w-5 h-5" />
                            {isExpanded && <span className="ml-3">Home</span>}
                        </button>
                    </li>

                    {/* Admin Menu Items */}
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = isActiveRoute(item.href)

                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors ${isActive ? 'bg-gray-700 text-blue-400' : ''
                                        } ${isExpanded ? 'justify-start' : 'justify-center'}`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {isExpanded && <span className="ml-3">{item.name}</span>}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={signOutAlert}
                    className="flex items-center w-full p-3 rounded-lg hover:bg-red-600 transition-colors text-red-400 hover:text-white"
                >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    {isExpanded && <span className="ml-3">Sign Out</span>}
                </button>
            </div>
        </div>
    )
}
