export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center">
                    &copy; {new Date().getFullYear()} Fuwari Sweet Shop. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
