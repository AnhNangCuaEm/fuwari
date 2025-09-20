import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="container mx-auto px-4 py-8 flex-1">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-600 mb-6">
                        商品を見つけられません
                    </h2>
                    <p className="text-gray-500 mb-8">
                        申し訳ありませんが、お探しの商品は見つかりませんでした。
                    </p>
                    <div className="space-x-4">
                        <Link
                            href="/products"
                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                        >
                            商品一覧へ戻る
                        </Link>
                        <Link
                            href="/"
                            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-300"
                        >
                            ホームに戻る
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
