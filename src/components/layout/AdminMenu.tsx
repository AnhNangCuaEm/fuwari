'use client'

import Link from "next/link"
import { Sling as Hamburger } from 'hamburger-react'
import { useState } from "react"
import { useCurrentUser } from "@/lib/hooks/useAuth"
import { signOut } from "next-auth/react"

export default function AdminMenu() {

    const [isOpen, setIsOpen] = useState(false)
    const { user, isAuthenticated, isLoading } = useCurrentUser()

    const isAdmin = user?.role === 'admin'

    const handleSignOut = () => {
        signOut({ callbackUrl: '/' })
        setIsOpen(false)
    }

    return (
        <nav className="relative">
            {/* User Info Display */}
            {/* {isAuthenticated && user && (
                <div className="hidden md:flex items-center mr-4 text-sm text-gray-600">
                    <span className="mr-2">Hi, <strong>{user.name}</strong></span>
                    {isAdmin && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                            Admin
                        </span>
                    )}
                </div>
            )} */}

            {/* Hamburger Button - Always visible */}
            <div>
                <Hamburger
                    toggled={isOpen}
                    toggle={setIsOpen}
                    size={24}
                />
            </div>

            {/* Menu - Toggle visibility */}
            <ul className={`
                absolute top-12 right-0 w-56 bg-white shadow-lg rounded-lg border
                transition-all duration-300 ease-in-out z-50
                ${isOpen
                    ? 'opacity-100 visible transform translate-y-0'
                    : 'opacity-0 invisible transform -translate-y-2'
                }
            `}>
                <li className="border-b border-gray-100 last:border-b-0">
                    <Link
                        href="/"
                        className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        🏠 Home
                    </Link>
                </li>
                {/* User-specific menu items */}
                {isAuthenticated ? (
                    <>
                        <li className="border-b border-gray-100 last:border-b-0">
                            <Link
                                href="/mypage"
                                className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                👤 プロフィール
                            </Link>
                        </li>

                        {isAdmin && (
                            <>
                                <li className="border-b border-gray-100 last:border-b-0">
                                    <Link
                                        href="/admin/dashboard"
                                        className="block px-4 py-3 hover:bg-gray-50 transition-colors text-blue-600 font-semibold"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        ⚙️ Admin Dashboard
                                    </Link>
                                </li>
                                <li className="border-b border-gray-100 last:border-b-0">
                                    <Link
                                        href="/admin/users"
                                        className="block px-4 py-3 hover:bg-gray-50 transition-colors text-blue-600"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        👥 ユーザー管理
                                    </Link>
                                </li>
                            </>
                        )}

                        <li className="border-b border-gray-100 last:border-b-0">
                            <button
                                onClick={handleSignOut}
                                className="w-full text-left block px-4 py-3 hover:bg-red-50 transition-colors text-red-600"
                            >
                                🚪 ログアウト
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li className="border-b border-gray-100 last:border-b-0">
                            <Link
                                href="/auth/signin"
                                className="block px-4 py-3 hover:bg-gray-50 transition-colors text-blue-600"
                                onClick={() => setIsOpen(false)}
                            >
                                🔐 ログイン
                            </Link>
                        </li>
                    </>
                )}

                {/* Loading state */}
                {isLoading && (
                    <li className="border-b border-gray-100">
                        <div className="px-4 py-3 text-gray-500 text-center">
                            <div className="animate-pulse">読み込み中...</div>
                        </div>
                    </li>
                )}
            </ul>
        </nav>
    );
}
