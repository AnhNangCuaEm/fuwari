import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { getAllProducts } from '@/lib/products';
import { Product } from '@/types/product';
import { getTranslations, getLocale } from 'next-intl/server';
import AddToCartButton from '@/components/products/AddToCartButton';

export default async function ProductsPage() {
    const products = await getAllProducts();
    const t = await getTranslations();
    const locale = await getLocale();

    // Helper function to get localized text
    const getLocalizedText = (jaText: string, enText: string) => {
        return locale === 'en' ? enText : jaText;
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="container mx-auto px-4 py-8 flex-1">
                {/* Breadcrumb */}
                <nav className="mb-4">
                    <Link
                        href="/"
                        className="text-almond-6 hover:text-almond-8 mr-2"
                    >
                        {t('common.home')}
                    </Link>
                    <span className="text-gray-500 mr-2">/</span>
                    <span className="text-gray-700">{t('products.title')}</span>
                </nav>

                <h1 className="text-3xl font-bold text-center mb-8">
                    {locale === 'en' ? 'Products' : '商品'}
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product: Product) => (
                        <div
                            key={product.id}
                            className="relative flex flex-col bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-80"
                        >
                            {/* Background Image */}
                            <Link href={`/products/${product.id}`} className="absolute inset-0">
                                <Image
                                    src={product.image}
                                    alt={getLocalizedText(product.name, product.engName)}
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                            </Link>

                            {/* Product Info Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-between p-3 bg-white/50 backdrop-blur-sm">
                                <Link href={`/products/${product.id}`}>
                                    <h2 className="text-xl font-semibold mb-2">
                                        {getLocalizedText(product.name, product.engName)}
                                    </h2>
                                </Link>
                                <p className="text-gray-800 mb-3 line-clamp-2 truncate">
                                    {getLocalizedText(product.description, product.engDescription)}
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-green-600">
                                        {product.price.toLocaleString(locale === 'en' ? 'en-US' : 'ja-JP')} &yen;
                                    </span>
                                    <span className={`text-sm ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {product.quantity > 0
                                            ? `${locale === 'en' ? 'Stock' : '在庫'}: ${product.quantity}`
                                            : (locale === 'en' ? 'Sold Out' : '売り切れ')
                                        }
                                    </span>
                                    <AddToCartButton 
                                        product={{
                                            id: product.id,
                                            name: getLocalizedText(product.name, product.engName),
                                            description: getLocalizedText(product.description, product.engDescription),
                                            price: product.price,
                                            image: product.image,
                                            quantity: product.quantity
                                        }}
                                    />
                                </div>

                            </div>
                        </div>
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