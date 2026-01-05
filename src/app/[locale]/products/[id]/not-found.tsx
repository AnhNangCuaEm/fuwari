import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { useTranslations } from 'next-intl';

export default function NotFound() {
    const t = useTranslations();

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="container mx-auto px-4 pt-32 pb-16 flex-1">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-600 mb-6">
                        {t('notFound.title')}
                    </h2>
                    <p className="text-gray-500 mb-8">
                        {t('notFound.subtitle')}
                    </p>
                    <div className="space-x-4">
                        <Link
                            href="/products"
                            className="inline-block bg-[#CC8409] text-white px-6 py-3 rounded-lg hover:bg-[#D6B884] transition-colors duration-300"
                        >
                            {t('notFound.goProducts')}
                        </Link>
                        <Link
                            href="/"
                            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-300"
                        >
                            {t('notFound.goHome')}
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
