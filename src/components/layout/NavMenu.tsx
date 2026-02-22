'use client'

import { Link } from "@/i18n/navigation"
import { Divide as Hamburger } from 'hamburger-react'
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useCurrentUser } from "@/lib/hooks/useAuth"
import CartDrawer from "@/components/cart/CartDrawer"
import LanguageModal from "@/components/ui/LanguageModal"
import SearchModal from "@/components/ui/SearchModal"
import NotificationModal from "@/components/ui/NotificationModal"
import { useNotifications } from "@/lib/hooks/useNotifications"
import { useCart } from "@/lib/hooks/useCart"
import type { NotificationWithStatus } from "@/lib/notifications"
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

// --- Icon Components ---
function SearchIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.9536 14.9458L21 21M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

function BellIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.318 2 5.5 4.818 5.5 8.5V12.5C5.5 13.5 5 14 4 14.5C3.5 14.7 3.2 15.2 3.2 15.8C3.2 16.5 3.7 17 4.4 17H19.6C20.3 17 20.8 16.5 20.8 15.8C20.8 15.2 20.5 14.7 20 14.5C19 14 18.5 13.5 18.5 12.5V8.5C18.5 4.818 15.682 2 12 2Z" fill="currentColor"/>
            <path d="M10.5 19C10.5 20.38 11.62 21.5 13 21.5C14.38 21.5 15.5 20.38 15.5 19H10.5Z" fill="currentColor"/>
        </svg>
    )
}

function CartIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M1.28869 2.76279C1.41968 2.36983 1.84442 2.15746 2.23737 2.28845L2.50229 2.37675C2.51549 2.38115 2.52864 2.38554 2.54176 2.38991C3.16813 2.59867 3.69746 2.7751 4.11369 2.96873C4.55613 3.17456 4.94002 3.42965 5.23112 3.83352C5.52221 4.2374 5.64282 4.68226 5.69817 5.16708C5.75025 5.62318 5.75023 6.18114 5.7502 6.84139L5.7502 9.49996C5.7502 10.9354 5.7518 11.9365 5.85335 12.6918C5.952 13.4256 6.13245 13.8142 6.40921 14.091C6.68598 14.3677 7.07455 14.5482 7.80832 14.6468C8.56367 14.7484 9.56479 14.75 11.0002 14.75H18.0002C18.4144 14.75 18.7502 15.0857 18.7502 15.5C18.7502 15.9142 18.4144 16.25 18.0002 16.25H10.9453C9.57774 16.25 8.47542 16.25 7.60845 16.1334C6.70834 16.0124 5.95047 15.7535 5.34855 15.1516C4.74664 14.5497 4.48774 13.7918 4.36673 12.8917C4.25017 12.0247 4.25018 10.9224 4.2502 9.55484L4.2502 6.883C4.2502 6.17 4.24907 5.69823 4.20785 5.33722C4.16883 4.99538 4.10068 4.83049 4.01426 4.71059C3.92784 4.59069 3.79296 4.47389 3.481 4.32877C3.15155 4.17551 2.70435 4.02524 2.02794 3.79978L1.76303 3.71147C1.37008 3.58049 1.15771 3.15575 1.28869 2.76279Z" fill="currentColor"/>
            <path opacity="0.5" d="M5.74512 6C5.75008 6.25912 5.75008 6.53957 5.75007 6.8414L5.75006 9.5C5.75006 10.9354 5.75166 11.9365 5.85321 12.6919C5.86803 12.8021 5.8847 12.9046 5.90326 13H16.0221C16.9815 13 17.4612 13 17.8369 12.7523C18.2126 12.5045 18.4016 12.0636 18.7795 11.1818L19.2081 10.1818C20.0176 8.29294 20.4223 7.34853 19.9777 6.67426C19.5331 6 18.5056 6 16.4507 6H5.74512Z" fill="currentColor"/>
            <path d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z" fill="currentColor"/>
            <path d="M18 19.5001C18 18.6716 17.3284 18.0001 16.5 18.0001C15.6716 18.0001 15 18.6716 15 19.5001C15 20.3285 15.6716 21.0001 16.5 21.0001C17.3284 21.0001 18 20.3285 18 19.5001Z" fill="currentColor"/>
        </svg>
    )
}

// --- Menu Item component with stagger animation ---
function MenuItem({
    children,
    index,
    onClick,
}: {
    children: React.ReactNode
    index: number
    onClick?: () => void
}) {
    return (
        <motion.li
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{
                duration: 0.3,
                delay: index * 0.04,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            onClick={onClick}
        >
            {children}
        </motion.li>
    )
}

// --- NavButton (icon buttons in the toolbar) ---
function NavButton({
    children,
    onClick,
    badge,
    label,
}: {
    children: React.ReactNode
    onClick?: () => void
    badge?: number
    label: string
}) {
    return (
        <button
            onClick={onClick}
            aria-label={label}
            className="relative p-2.5 rounded-full bg-white/60 backdrop-blur-sm border border-cosmos-100/60 text-almond-8 hover:bg-cosmos-50 hover:text-cosmos-500 hover:border-cosmos-200 transition-colors duration-200 shadow-sm"
        >
            {children}
            {badge != null && badge > 0 && (
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 bg-cosmos-400 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md ring-2 ring-white"
                >
                    {badge}
                </motion.span>
            )}
        </button>
    )
}

// --- Main NavMenu ---
export default function NavMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false)
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [selectedNotif, setSelectedNotif] = useState<NotificationWithStatus | null>(null)
    const bellRef = useRef<HTMLDivElement>(null)
    const notifDropdownRef = useRef<HTMLDivElement>(null)
    const { user, isAuthenticated, isLoading } = useCurrentUser()
    const { getTotalItems } = useCart()
    const { notifications, unreadCount, fetchNotifications, markAllAsRead } = useNotifications()
    const t = useTranslations()
    const [mounted, setMounted] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const isAdmin = user?.role === 'admin'

    useEffect(() => {
        setMounted(true)
    }, [])

    // Close menu on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    // Close menu on Escape
    useEffect(() => {
        function handleEsc(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                setIsOpen(false)
                setIsNotificationOpen(false)
            }
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [])

    // Close notification dropdown on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                notifDropdownRef.current &&
                !notifDropdownRef.current.contains(e.target as Node) &&
                bellRef.current &&
                !bellRef.current.contains(e.target as Node)
            ) {
                setIsNotificationOpen(false)
            }
        }
        if (isNotificationOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isNotificationOpen])

    // Lock body scroll on mobile overlay
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    const closeMenu = () => setIsOpen(false)

    // Menu items config
    const mobileNavItems = [
        { href: '/products', icon: '/icons/cake.svg', label: t('common.menu'), mobileOnly: true },
        { href: '/about', icon: '/icons/shop.svg', label: t('common.shop'), mobileOnly: true },
        { href: '/contact', icon: '/icons/information.svg', label: t('common.contact'), mobileOnly: true },
    ]

    const menuLinkClass =
        "flex items-center gap-3 px-5 py-3 rounded-xl text-almond-9 hover:bg-cosmos-50/80 hover:text-cosmos-600 active:bg-cosmos-100 transition-all duration-200 group"

    return (
        <nav className="relative flex items-center gap-1.5 sm:gap-2" ref={menuRef}>
            {/* Icon Buttons */}
            <NavButton label={t('common.search')} onClick={() => setIsSearchModalOpen(true)}>
                <SearchIcon />
            </NavButton>

            <div ref={bellRef} className="inline-flex">
                <NavButton label="Notifications" onClick={() => {
                    setIsNotificationOpen(prev => {
                        if (!prev) fetchNotifications()
                        return !prev
                    })
                }} badge={unreadCount > 0 ? unreadCount : undefined}>
                    <BellIcon />
                </NavButton>
            </div>

            <NavButton label={t('common.cart')} onClick={() => setIsCartOpen(true)} badge={getTotalItems()}>
                <CartIcon />
            </NavButton>

            {/* Menu Toggle */}
            <div
                className={`
                    rounded-full border transition-all duration-300 shadow-sm
                    ${isOpen
                        ? 'bg-cosmos-100 border-cosmos-300 text-cosmos-600'
                        : 'bg-white/60 backdrop-blur-sm border-cosmos-100/60 text-almond-8 hover:bg-cosmos-50 hover:text-cosmos-500 hover:border-cosmos-200'
                    }
                `}
            >
                <Hamburger
                    toggled={isOpen}
                    toggle={setIsOpen}
                    size={20}
                    rounded
                    label="Toggle menu"
                    duration={0.4}
                />
            </div>

            {/* Mobile overlay backdrop */}
            <AnimatePresence>
                {isOpen && mounted && createPortal(
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 md:hidden"
                        onClick={closeMenu}
                    />,
                    document.body
                )}
            </AnimatePresence>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{
                            duration: 0.25,
                            ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        className="
                            absolute top-[calc(100%+10px)] right-0 z-50
                            w-[280px] max-h-[85vh] overflow-y-auto
                            bg-white/95 backdrop-blur-xl
                            border border-cosmos-100/80
                            rounded-2xl shadow-[0_20px_60px_-15px_rgba(201,57,71,0.15),0_8px_24px_-8px_rgba(0,0,0,0.08)]
                            py-2
                        "
                    >
                        {/* User Header */}
                        {isAuthenticated && user && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="px-5 py-3.5 mb-1 border-b border-cosmos-100/60"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cosmos-200 to-cosmos-300 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-almond-10 truncate">{user.name}</p>
                                        <p className="text-xs text-almond-6 truncate">{user.email}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <ul className="py-1 px-2 overflow-x-hidden">
                            {/* Mobile-only nav links */}
                            {mobileNavItems.map((item, i) => (
                                <MenuItem key={item.href} index={i} onClick={closeMenu}>
                                    <Link href={item.href} className={`${menuLinkClass} md:hidden`}>
                                        <Image src={item.icon} alt="" width={20} height={20} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                                        <span className="font-medium text-sm">{item.label}</span>
                                    </Link>
                                </MenuItem>
                            ))}

                            {/* Separator for mobile */}
                            <li className="md:hidden my-1.5 mx-3 border-t border-cosmos-100/50" />

                            {/* Orders (authenticated) */}
                            {isAuthenticated && (
                                <MenuItem index={mobileNavItems.length} onClick={closeMenu}>
                                    <Link href="/orders" className={menuLinkClass}>
                                        <Image src="/icons/orders.svg" alt="" width={20} height={20} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                                        <span className="font-medium text-sm">{t('common.orders')}</span>
                                    </Link>
                                </MenuItem>
                            )}

                            {/* Language */}
                            <MenuItem index={mobileNavItems.length + 1}>
                                <button
                                    onClick={() => {
                                        setIsLanguageModalOpen(true)
                                        closeMenu()
                                    }}
                                    className={`w-full text-left ${menuLinkClass}`}
                                >
                                    <Image src="/icons/language.svg" alt="" width={19} height={19} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                                    <span className="font-medium text-sm">{t('common.language')}</span>
                                </button>
                            </MenuItem>

                            <li className="my-1.5 mx-3 border-t border-cosmos-100/50" />

                            {/* Auth section */}
                            {isAuthenticated ? (
                                <>
                                    <MenuItem index={mobileNavItems.length + 2} onClick={closeMenu}>
                                        <Link href="/mypage" className={menuLinkClass}>
                                            <Image src="/icons/profile.svg" alt="" width={20} height={20} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                                            <span className="font-medium text-sm">{t('common.myPage')}</span>
                                        </Link>
                                    </MenuItem>

                                    {isAdmin && (
                                        <MenuItem index={mobileNavItems.length + 3} onClick={closeMenu}>
                                            <Link href="/admin/dashboard" className={`${menuLinkClass} !text-cosmos-500 font-semibold`}>
                                                <Image src="/icons/dashboard.svg" alt="" width={20} height={20} className="opacity-80" />
                                                <span className="text-sm">{t('common.admin')}</span>
                                                <span className="ml-auto text-[10px] bg-cosmos-100 text-cosmos-500 px-2 py-0.5 rounded-full font-bold tracking-wide">ADMIN</span>
                                            </Link>
                                        </MenuItem>
                                    )}
                                </>
                            ) : (
                                <MenuItem index={mobileNavItems.length + 2} onClick={closeMenu}>
                                    <Link href="/auth/signin" className="flex items-center gap-3 px-5 py-3 mx-1 mb-1 rounded-xl bg-gradient-to-r from-cosmos-300 to-cosmos-400 text-white hover:from-cosmos-400 hover:to-cosmos-500 active:from-cosmos-500 active:to-cosmos-600 transition-all duration-200 shadow-md shadow-cosmos-200/40 group">
                                        <Image src="/icons/login.svg" alt="" width={20} height={20} className="brightness-0 invert opacity-90" />
                                        <span className="font-semibold text-sm">{t('common.signin')}</span>
                                    </Link>
                                </MenuItem>
                            )}

                            {/* Loading state */}
                            {isLoading && (
                                <motion.li
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="px-5 py-3 text-center"
                                >
                                    <div className="flex items-center justify-center gap-2 text-almond-6 text-sm">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-4 h-4 border-2 border-cosmos-200 border-t-cosmos-400 rounded-full"
                                        />
                                        {t('common.loading')}
                                    </div>
                                </motion.li>
                            )}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>

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

            {/* Notification Dropdown — portal ra document.body, AnimatePresence bên trong portal */}
            {mounted && createPortal(
                <>
                    {/* Backdrop mobile */}
                    <AnimatePresence>
                        {isNotificationOpen && (
                            <motion.div
                                key="notif-backdrop"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 md:hidden"
                                onClick={() => setIsNotificationOpen(false)}
                            />
                        )}
                    </AnimatePresence>

                    {/* Dropdown panel */}
                    <AnimatePresence>
                        {isNotificationOpen && (
                            <motion.div
                                key="notif-dropdown"
                                ref={notifDropdownRef}
                                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                                style={{
                                    position: 'fixed',
                                    top: bellRef.current
                                        ? bellRef.current.getBoundingClientRect().bottom + 10
                                        : 60,
                                    right: bellRef.current
                                        ? window.innerWidth - bellRef.current.getBoundingClientRect().right
                                        : 16,
                                }}
                                className="z-50 w-[320px] max-h-[70vh] flex flex-col bg-white/95 backdrop-blur-xl border border-cosmos-100/80 rounded-2xl shadow-[0_20px_60px_-15px_rgba(201,57,71,0.15),0_8px_24px_-8px_rgba(0,0,0,0.08)] overflow-hidden"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-5 py-3.5 border-b border-cosmos-100/60">
                                    <div className="flex items-center gap-2">
                                        <BellIcon/>
                                        <span className="font-bold text-sm text-almond-10">Notifications</span>
                                        {notifications.length > 0 && (
                                            <span className="text-[10px] bg-cosmos-100 text-cosmos-600 px-1.5 py-0.5 rounded-full font-semibold">
                                                {notifications.length}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setIsNotificationOpen(false)}
                                        className="p-1 rounded-full hover:bg-cosmos-50 text-almond-6 hover:text-cosmos-500 transition-colors"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M18 6L6 18M6 6l12 12"/>
                                        </svg>
                                    </button>
                                </div>

                                {/* List */}
                                <ul className="flex-1 overflow-y-auto overflow-x-hidden py-1 px-2 space-y-0.5">
                                    {notifications.length === 0 ? (
                                        <li className="flex flex-col items-center justify-center py-10 text-almond-5">
                                            <BellIcon/>
                                            <span className="text-xs">No notifications</span>
                                        </li>
                                    ) : (
                                        notifications.map((notif, i) => (
                                            <motion.li
                                                key={notif.id}
                                                initial={{ opacity: 0, x: 12 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.03 }}
                                            >
                                                <button
                                                    onClick={() => {
                                                        setSelectedNotif(notif)
                                                        setIsNotificationOpen(false)
                                                        if (!notif.is_read) markAllAsRead()
                                                    }}
                                                    className="w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-cosmos-50/80 hover:text-cosmos-600 active:bg-cosmos-100 transition-all duration-200 group"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <p className={`text-sm font-semibold truncate ${notif.is_read ? 'text-almond-6' : 'text-almond-9'}`}>
                                                                {notif.title}
                                                            </p>
                                                            {!notif.is_read && (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-cosmos-400 shrink-0" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-almond-5 truncate mt-0.5">{notif.body}</p>
                                                    </div>
                                                </button>
                                            </motion.li>
                                        ))
                                    )}
                                </ul>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>,
                document.body
            )}

            {/* Notification Detail Modal (portal) */}
            <NotificationModal
                notification={selectedNotif}
                onClose={() => setSelectedNotif(null)}
            />
        </nav>
    )
}