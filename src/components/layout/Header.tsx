import NavMenu from './NavMenu'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

export default function Header() {
    return (
        <header className="flex items-center justify-between p-4 bg-white shadow-md">
            <h1>Fuwari Logo</h1>
            <div className="flex items-center space-x-4">
                <LanguageSwitcher />
                <NavMenu />
            </div>
        </header>
    )
}
