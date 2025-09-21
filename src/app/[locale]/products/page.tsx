'use client'

import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { getAllProducts } from '@/lib/products';
import { Product } from '@/types/product';
import { useCart } from '@/lib/hooks/useCart';
import { useTranslations, useLocale } from 'next-intl';

export default function ProductsPage() {
    const products = getAllProducts();
    const { addToCart } = useCart()
    const t = useTranslations();
    const locale = useLocale();

    // Helper function to get localized text
    const getLocalizedText = (jaText: string, enText: string) => {
        return locale === 'en' ? enText : jaText;
    };

    const handleAddToCart = (product: Product, e: React.MouseEvent) => {
        e.preventDefault() // Prevent the Link navigation
        addToCart({
            id: product.id,
            name: getLocalizedText(product.name, product.engName),
            description: getLocalizedText(product.description, product.engDescription),
            price: product.price,
            image: product.image
        })
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="container mx-auto px-4 py-8 flex-1">
                <nav className="mb-8">
                    <Link
                        href="/"
                        className="btn text-white hover:bg-gray-700"
                    >
                        {t("breadcrumb.home")}
                    </Link>
                </nav>
                <h1 className="text-3xl font-bold text-center mb-8">
                    {locale === 'en' ? 'Products' : '商品'}
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product: Product) => (
                        <div
                            key={product.id}
                            className="flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                        >
                            <Link href={`/products/${product.id}`}>
                                <div className="overflow-hidden rounded-t-lg">
                                    <Image
                                        src={product.image}
                                        alt={getLocalizedText(product.name, product.engName)}
                                        width={300}
                                        height={300}
                                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            </Link>

                            <div className="flex flex-col justify-between p-4 flex-1">
                                <Link href={`/products/${product.id}`}>
                                    <h2 className="text-xl font-semibold mb-2 hover:text-orange-600">
                                        {getLocalizedText(product.name, product.engName)}
                                    </h2>
                                </Link>
                                <p className="text-gray-600 mb-3 line-clamp-2">
                                    {getLocalizedText(product.description, product.engDescription)}
                                </p>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-lg font-bold text-green-600">
                                        {product.price.toLocaleString(locale === 'en' ? 'en-US' : 'ja-JP')} &yen;
                                    </span>
                                    <span className={`text-sm ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {product.quantity > 0 
                                            ? `${locale === 'en' ? 'Stock' : '在庫'}: ${product.quantity}` 
                                            : (locale === 'en' ? 'Sold Out' : '売り切れ')
                                        }
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/products/${product.id}`}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium text-center transition-colors cursor-pointer"
                                    >
                                        {t("shopping.detail")}
                                    </Link>
                                    <button
                                        onClick={(e) => handleAddToCart(product, e)}
                                        disabled={product.quantity === 0}
                                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer ${product.quantity > 0
                                                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed!'
                                            }`}
                                    >
                                        {product.quantity > 0 ? t("shopping.cart.addToCart") : t("shopping.stock.outOfStock")}
                                    </button>
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