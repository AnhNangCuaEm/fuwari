import NavMenu from './NavMenu'

export default function Header() {
    return (
        <header className="flex items-center justify-between p-4">
            <h1>Fuwari Logo</h1>
            <div className="flex items-center space-x-4">
                <NavMenu />
            </div>
        </header>
    )
}
