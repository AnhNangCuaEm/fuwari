import NavMenu from './NavMenu'
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
    return (
        <header className="flex items-center justify-between border-b-2 border-[#F2E9DF] py-4 px-6 md:px-8">
            <Link href="/" className="text-lg font-bold">
                <Image
                    src="/logo.svg"
                    alt="Fuwari Sweet Shop Logo"
                    width={150}
                    height={100}
                    className='sm:w-36 w-28'
                />
            </Link>

            <ul className='hidden md:flex space-x-6 text-lg'>
                <li className='hover:text-almond-5 transition-colors'><Link href="/products">Menu</Link></li>
                <li className='hover:text-almond-5 transition-colors'><Link href="/about">Shop</Link></li>
                <li className='hover:text-almond-5 transition-colors'><Link href="/contact">Contact</Link></li>
            </ul>

            <div className="flex items-center space-x-4">
                <NavMenu />
            </div>
        </header>
    )
}
