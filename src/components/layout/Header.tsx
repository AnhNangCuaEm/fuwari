'use client'

import NavMenu from './NavMenu'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

function NavLink({ href, label, isActive }: { href: string; label: string; isActive: boolean }) {
    return (
        <li className="relative">
            <Link
                href={href}
                className={`relative px-1 py-1.5 text-[15px] font-medium transition-colors duration-200
                    ${isActive ? 'text-cosmos-500' : 'text-almond-7 hover:text-cosmos-400'}
                `}
            >
                {label}
                {/* Animated underline */}
                {isActive && (
                    <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-cosmos-300 to-cosmos-400"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                )}
            </Link>
        </li>
    )
}

export default function Header() {
    const pathname = usePathname()
    const t = useTranslations()

    const isActive = (href: string) => pathname === href || pathname?.endsWith(href)

    const navItems = [
        { href: '/products', label: t('common.menu') },
        { href: '/about', label: t('common.shop') },
        { href: '/contact', label: t('common.contact') },
    ]

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed top-0 left-0 right-0 w-full z-50 border-b border-cosmos-100/40 bg-white/70 backdrop-blur-xl max-w-[100vw]"
        >
            <div className="flex items-center justify-between py-3 px-4 sm:px-6 md:px-8">
                {/* Logo */}
                <Link href="/" className="relative group">
                    <Image
                        src="/logo.svg"
                        alt="Fuwari Sweet Shop Logo"
                        width={150}
                        height={100}
                        className="sm:w-36 w-28"
                        priority
                    />
                </Link>

                {/* Desktop Nav Links */}
                <ul className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.href}
                            href={item.href}
                            label={item.label}
                            isActive={isActive(item.href)}
                        />
                    ))}
                </ul>

                {/* Right Side: NavMenu */}
                <div className="flex items-center">
                    <NavMenu />
                </div>
            </div>
        </motion.header>
    )
}
