import NavMenu from './NavMenu'
import Link from 'next/link'

export default function Header() {
    return (
        <header className="flex items-center justify-between p-4">
            <Link href="/" className="text-lg font-bold">
                <h1 className='bg-white'>Fuwari Logo</h1>
            </Link>

            <div className="flex items-center space-x-4">
                <NavMenu />
            </div>
        </header>
    )
}
