'use client'

import { Link } from "@/i18n/navigation"
import { Rotate as Hamburger } from 'hamburger-react'
import { useState } from "react"
import Image from "next/image"
import { useCurrentUser } from "@/lib/hooks/useAuth"
import CartDrawer from "@/components/cart/CartDrawer"
import LanguageModal from "@/components/ui/LanguageModal"
import SearchModal from "@/components/ui/SearchModal"
import { useCart } from "@/lib/hooks/useCart"
import { useTranslations } from 'next-intl'

export default function NavMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false)
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
    const { user, isAuthenticated, isLoading } = useCurrentUser()
    const { getTotalItems } = useCart()
    const t = useTranslations()

    const isAdmin = user?.role === 'admin'

    return (
        <nav className="relative flex gap-2">
            {/*Search - Always visible */}
            <div className="flex items-center">
                <button
                    onClick={() => setIsSearchModalOpen(true)}
                    className="flex items-center font-bold gap-2 p-2 rounded-4xl bg-[#F3EDE3] hover:bg-[#ffffffaa] transition-colors"
                >
                    <div className="relative">
                        <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M14.9536 14.9458L21 21M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                    </div>
                </button>
            </div>

            {/*Notifications - Always visible */}
            <div className="flex items-center">
                <button className="p-2 rounded-full bg-[#F3EDE3] hover:bg-[#ffffffaa] transition-colors">
                    <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="hover:cursor-pointer transition-colors">
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                            <path d="M12 2C8.318 2 5.5 4.818 5.5 8.5V12.5C5.5 13.5 5 14 4 14.5C3.5 14.7 3.2 15.2 3.2 15.8C3.2 16.5 3.7 17 4.4 17H19.6C20.3 17 20.8 16.5 20.8 15.8C20.8 15.2 20.5 14.7 20 14.5C19 14 18.5 13.5 18.5 12.5V8.5C18.5 4.818 15.682 2 12 2Z" fill="currentColor" />
                            <path d="M10.5 19C10.5 20.38 11.62 21.5 13 21.5C14.38 21.5 15.5 20.38 15.5 19H10.5Z" fill="currentColor" />
                        </g>
                    </svg>
                </button>
            </div>

            {/* Cart Button - Always visible */}
            <div className="flex items-center">
                <button
                    className="p-2 rounded-full bg-[#F3EDE3] hover:bg-[#ffffffaa] transition-colors group relative"
                    onClick={() => setIsCartOpen(true)}
                >
                    <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-900 hover:cursor-pointer transition-colors">
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                            <path fillRule="evenodd" clipRule="evenodd" d="M1.28869 2.76279C1.41968 2.36983 1.84442 2.15746 2.23737 2.28845L2.50229 2.37675C2.51549 2.38115 2.52864 2.38554 2.54176 2.38991C3.16813 2.59867 3.69746 2.7751 4.11369 2.96873C4.55613 3.17456 4.94002 3.42965 5.23112 3.83352C5.52221 4.2374 5.64282 4.68226 5.69817 5.16708C5.75025 5.62318 5.75023 6.18114 5.7502 6.84139L5.7502 9.49996C5.7502 10.9354 5.7518 11.9365 5.85335 12.6918C5.952 13.4256 6.13245 13.8142 6.40921 14.091C6.68598 14.3677 7.07455 14.5482 7.80832 14.6468C8.56367 14.7484 9.56479 14.75 11.0002 14.75H18.0002C18.4144 14.75 18.7502 15.0857 18.7502 15.5C18.7502 15.9142 18.4144 16.25 18.0002 16.25H10.9453C9.57774 16.25 8.47542 16.25 7.60845 16.1334C6.70834 16.0124 5.95047 15.7535 5.34855 15.1516C4.74664 14.5497 4.48774 13.7918 4.36673 12.8917C4.25017 12.0247 4.25018 10.9224 4.2502 9.55484L4.2502 6.883C4.2502 6.17 4.24907 5.69823 4.20785 5.33722C4.16883 4.99538 4.10068 4.83049 4.01426 4.71059C3.92784 4.59069 3.79296 4.47389 3.481 4.32877C3.15155 4.17551 2.70435 4.02524 2.02794 3.79978L1.76303 3.71147C1.37008 3.58049 1.15771 3.15575 1.28869 2.76279Z" fill="currentColor"></path>
                            <path opacity="0.5" d="M5.74512 6C5.75008 6.25912 5.75008 6.53957 5.75007 6.8414L5.75006 9.5C5.75006 10.9354 5.75166 11.9365 5.85321 12.6919C5.86803 12.8021 5.8847 12.9046 5.90326 13H16.0221C16.9815 13 17.4612 13 17.8369 12.7523C18.2126 12.5045 18.4016 12.0636 18.7795 11.1818L19.2081 10.1818C20.0176 8.29294 20.4223 7.34853 19.9777 6.67426C19.5331 6 18.5056 6 16.4507 6H5.74512Z" fill="currentColor"></path>
                            <path d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z" fill="currentColor"></path>
                            <path d="M18 19.5001C18 18.6716 17.3284 18.0001 16.5 18.0001C15.6716 18.0001 15 18.6716 15 19.5001C15 20.3285 15.6716 21.0001 16.5 21.0001C17.3284 21.0001 18 20.3285 18 19.5001Z" fill="currentColor"></path>
                        </g>
                    </svg>
                    {/* Cart Badge */}
                    {getTotalItems() > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {getTotalItems()}
                        </span>
                    )}
                </button>
            </div>

            {/* Hamburger Button - Always visible */}
            <div>
                <Hamburger
                    toggled={isOpen}
                    toggle={setIsOpen}
                    size={28}
                    rounded
                />
            </div>

            {/* Menu - Toggle visibility */}
            <ul className={`
                absolute top-12 right-0 w-40 bg-almond-1 shadow-lg rounded-xl overflow-hidden
                transition-all duration-300 ease-in-out z-50
                ${isOpen
                    ? 'opacity-100 visible transform translate-y-0'
                    : 'opacity-0 invisible transform -translate-y-2'
                }
            `}>
                {/* User info in mobile menu */}
                {isAuthenticated && user && (
                    <li className="border-b border-gray-300 bg-almond-100">
                        <div className="px-4 py-3">
                            <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                            <p className="text-sm text-gray-600 truncate">{user.email}</p>
                        </div>
                    </li>
                )}

                <li className="md:hidden border-b border-gray-200 last:border-b-0">
                    <Link
                        href="/products"
                        className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        <Image src="/icons/cake.svg" alt="Menu Icon" width={20} height={20} className="mr-3"/>
                        {t('common.menu')}
                    </Link>
                </li>

                <li className="md:hidden border-b border-gray-200 last:border-b-0">
                    <Link
                        href="/shop"
                        className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        <Image src="/icons/shop.svg" alt="Menu Icon" width={20} height={20} className="mr-3"/>
                        {t('common.shop')}
                    </Link>
                </li>

                <li className="md:hidden border-b border-gray-200 last:border-b-0">
                    <Link
                        href="/contact"
                        className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        <Image src="/icons/information.svg" alt="Contact Icon" width={20} height={20} className="mr-3"/>
                        {t('common.contact')}
                    </Link>
                </li>

                {/* Only visible to logged-in users */}
                {isAuthenticated && (
                    <li className="border-b border-gray-200 last:border-b-0">
                        <Link
                            href="/orders"
                            className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <Image src="/icons/orders.svg" alt="Orders Icon" width={20} height={20} className="mr-3"/>
                            {t('common.orders')}
                        </Link>
                    </li>
                )}
                {/* Language Selector */}
                <li className="border-b border-gray-200 last:border-b-0">
                    <button
                        onClick={() => {
                            setIsLanguageModalOpen(true)
                            setIsOpen(false)
                        }}
                        className="w-full text-left flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                        <Image src="/icons/language.svg" alt="Language Icon" width={19} height={19} className="mr-3"/>
                        {t('common.language')}
                    </button>
                </li>

                {/* User-specific menu items */}
                {isAuthenticated ? (
                    <>
                        <li className="border-b border-gray-200 last:border-b-0">
                            <Link
                                href="/mypage"
                                className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <Image src="/icons/profile.svg" alt="User Icon" width={20} height={20} className="mr-3"/>
                                {t('common.myPage')}
                            </Link>
                        </li>

                        {isAdmin && (
                            <>
                                <li className="border-b border-gray-200 last:border-b-0">
                                    <Link
                                        href="/admin/dashboard"
                                        className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-blue-600 font-semibold"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Image src="/icons/dashboard.svg" alt="Admin Icon" width={22} height={22} className="mr-3"/>
                                        {t('common.admin')}
                                    </Link>
                                </li>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <li className="border-b border-gray-200 last:border-b-0">
                            <Link
                                href="/auth/signin"
                                className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-almond-500 font-semibold"
                                onClick={() => setIsOpen(false)}
                            >
                                <Image src="/icons/login.svg" alt="Sign In Icon" width={20} height={20} className="mr-3"/>
                                {t('common.signin')}
                            </Link>
                        </li>
                    </>
                )}

                {/* Loading state */}
                {isLoading && (
                    <li className="border-b border-gray-200">
                        <div className="px-4 py-3 text-gray-500 text-center">
                            <div className="animate-pulse">{t('common.loading')}</div>
                        </div>
                    </li>
                )}
            </ul>

            {/* Cart Drawer */}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
            />

            {/* Language Modal */}
            <LanguageModal
                isOpen={isLanguageModalOpen}
                onClose={() => setIsLanguageModalOpen(false)}
            />

            {/* Search Modal */}
            <SearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
            />
        </nav>
    )
}