'use client'

import NavMenu from './NavMenu'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function Header() {
    const pathname = usePathname()

    const isActive = (href: string) => pathname === href

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b-2 backdrop-blur-sm border-[#F2E9DF] py-4 px-6 md:px-8">
            <Link href="/" className="text-lg font-bold">
                <Image
                    src="/logo.svg"
                    alt="Fuwari Sweet Shop Logo"
                    width={150}
                    height={100}
                    className='sm:w-36 w-28'
                    priority
                />
            </Link>
            <ul className='hidden md:flex space-x-6 text-cosmos-400 text-lg'>
                <li className={`transition-colors ${isActive('/products') ? 'text-almond-6' : 'hover:text-almond-6'}`}>
                    <Link href="/products">Menu</Link>
                </li>
                <li className={`transition-colors ${isActive('/about') ? 'text-almond-6' : 'hover:text-almond-6'}`}>
                    <Link href="/about">Shop</Link>
                </li>
                <li className={`transition-colors ${isActive('/contact') ? 'text-almond-6' : 'hover:text-almond-6'}`}>
                    <Link href="/contact">Contact</Link>
                </li>
            </ul>

            <div className="flex items-center space-x-4">
                <NavMenu />
            </div>
        </header>
    )
}
