import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { getAllProducts } from '@/lib/products';
import { Product } from '@/types/product';

export default function ProductsPage() {
    const products = getAllProducts();

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
            <Header />
            <div className="container mx-auto px-4 py-16 flex-1">
                <nav className="mb-8">
                    <Link
                        href="/"
                        className="btn text-white hover:bg-gray-700"
                    >
                        ← ホームへ戻る
                    </Link>
                </nav>
                <h1 className="text-3xl font-bold text-center mb-8">商品</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product: Product) => (
                        <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="overflow-hidden rounded-t-lg">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    width={300}
                                    height={300}
                                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </div>

                            <div className="p-4">
                                <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                                <p className="text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-green-600">
                                        {product.price.toLocaleString('ja-JP')} &yen;
                                    </span>
                                    <span className="text-blue-500 hover:text-blue-700 font-medium">
                                        詳細へ
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">商品はありません</p>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}