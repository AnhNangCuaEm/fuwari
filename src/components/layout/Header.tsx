import NavMenu from './NavMenu'

export default function Header() {
    return (
        <header className="flex items-center justify-between p-4 bg-white shadow-md">
            <h1>Fuwari Logo</h1>
            <NavMenu />
        </header>
    )
}
