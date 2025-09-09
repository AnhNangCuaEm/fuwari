import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";


export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 flex-1">
                <h1 className="text-4xl font-bold">About Page</h1>
            </div>
            <Footer />
        </div>
    );
}
