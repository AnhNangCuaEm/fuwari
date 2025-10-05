'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { useCart } from '@/lib/hooks/useCart';
import { useTranslations, useLocale } from 'next-intl';

export default function ProductsClient() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToCart } = useCart();
    const t = useTranslations();
    const locale = useLocale();

    // Fetch products from API
    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error loading products:', error);
                setIsLoading(false);
            });
    }, []);

    // Helper function to get localized text
    const getLocalizedText = (jaText: string, enText: string) => {
        return locale === 'en' ? enText : jaText;
    };

    const handleAddToCart = (product: Product, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent the Link navigation
        addToCart({
            id: product.id,
            name: getLocalizedText(product.name, product.engName),
            description: getLocalizedText(product.description, product.engDescription),
            price: product.price,
            image: product.image
        });
    };

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-almond-6"></div>
                <p className="mt-4 text-gray-600">{t('common.loading')}</p>
            </div>
        );
    }

    return (
        <>
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
                                <button
                                    onClick={(e) => handleAddToCart(product, e)}
                                    disabled={product.quantity === 0}
                                    className={`py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer ${product.quantity > 0
                                        ? 'bg-almond-6/80 hover:bg-almond-5/80 text-white'
                                        : 'bg-gray-400 text-gray-700 cursor-not-allowed!'
                                        }`}
                                >
                                    {product.quantity > 0 ? t("shopping.cart.addToCart") : t("shopping.stock.outOfStock")}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {products.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                        {locale === 'en' ? 'No products available' : '商品はありません'}
                    </p>
                </div>
            )}
        </>
    );
}
