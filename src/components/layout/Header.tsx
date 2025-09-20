import NavMenu from './NavMenu'
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
    return (
        <header className="flex items-center justify-between p-4">
            <Link href="/" className="text-lg font-bold">
                <Image
                    src="/logo.svg"
                    alt="Fuwari Sweet Shop Logo"
                    width={150}
                    height={100}
                />
            </Link>

            <div className="flex items-center space-x-4">
                <NavMenu />
            </div>
        </header>
    )
}
