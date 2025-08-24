import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { getProductById } from '@/lib/products';

interface ProductDetailPageProps {
    params: {
        id: string;
    };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
    const productId = parseInt(params.id);
    const product = getProductById(productId);

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
            <Header />
            <div className="container mx-auto px-4 py-16 flex-1">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <Link
                        href="/products"
                        className="btn text-white hover:bg-gray-700"
                    >
                        ← 商品一覧へ戻る
                    </Link>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Image */}
                    <div className="space-y-4">
                        <div className="overflow-hidden rounded-lg shadow-lg">
                            <Image
                                src={product.image}
                                alt={product.name}
                                width={600}
                                height={400}
                                className="w-full h-96 object-cover"
                            />
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-sm text-gray-500">Giá:</span>
                                <span className="text-3xl font-bold text-green-600">
                                    {product.price.toLocaleString('ja-JP')} &yen;
                                </span>
                            </div>

                            <div className="space-y-4">
                                <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-semibold">
                                    カートに追加
                                </button>

                                <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-300 font-semibold">
                                    今すぐ購入
                                </button>
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold mb-4">商品情報</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">商品コード:</span>
                                    <span className="font-medium">SP{product.id.toString().padStart(3, '0')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">在庫状況:</span>
                                    <span className="font-medium text-green-600">在庫あり</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products Section (Optional) */}
                <div className="mt-12 border-t border-gray-200 pt-8">
                    <h2 className="text-2xl font-bold mb-6">関連商品</h2>
                    <div className="text-center py-8">
                        <Link
                            href="/products"
                            className="inline-block bg-blue-100 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-200 transition-colors duration-300"
                        >
                            すべての製品を見る
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

// Generate static params for static generation to improve performance (optional)
export async function generateStaticParams() {
    const { getAllProducts } = await import('@/lib/products');
    const products = getAllProducts();

    return products.map((product) => ({
        id: product.id.toString(),
    }));
}
