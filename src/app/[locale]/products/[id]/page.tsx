'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { ModelViewer } from '@/components/ui/ModelViewer';
import { getProductById } from '@/lib/products';
import { useState } from 'react';
import { Product } from '@/types/product';
import { useCart } from '@/lib/hooks/useCart';
import { useTranslations, useLocale } from 'next-intl';


interface ProductDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
    const resolvedParams = React.use(params);
    const productId = parseInt(resolvedParams.id);
    const product = getProductById(productId);
    const [showModel, setShowModel] = useState(true);
    const { addToCart } = useCart();
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

    if (!product) {
        notFound();
    }

    const toggleView = () => {
        setShowModel(!showModel);
    };

    const getStockStatus = (quantity: number) => {
        if (quantity === 0) {
            return {
                text: locale === 'en' ? 'Out of Stock' : '在庫なし',
                color: 'text-red-600'
            };
        } else if (quantity < 10) {
            return {
                text: locale === 'en' ? 'Limited Stock' : '残りわずか',
                color: 'text-orange-500'
            };
        } else {
            return {
                text: locale === 'en' ? 'In Stock' : '在庫あり',
                color: 'text-green-600'
            };
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="container mx-auto px-4 py-8 flex-1">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <Link
                        href="/"
                        className="text-almond-6 hover:text-almond-8 mr-2"
                    >
                        {t('common.home')}
                    </Link>
                    <span className="text-gray-500 mr-2">/</span>
                    <Link
                        href="/products"
                        className="text-almond-6 hover:text-almond-8 mr-2"
                    >
                        {t('products.title')}
                    </Link>
                    <span className="text-gray-500 mr-2">/</span>
                    <span className="text-gray-700">{t('products.detail')}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
                    {/* Left Column - 3D Model and Related Products */}
                    <div className="space-y-8">
                        {/* Product 3D Model */}
                        <div className="space-y-4">
                            <div className="overflow-hidden rounded-lg shadow-lg bg-white">
                                {product.modelPath && showModel ? (
                                    <ModelViewer
                                        key={`model-${product.id}-${showModel}`} // Force re-render when toggling
                                        modelPath={product.modelPath}
                                        className="w-full h-96"
                                    />
                                ) : (
                                    <div key={`image-${product.id}-${showModel}`} className="w-full h-96 flex items-center justify-center">
                                        <Image
                                            src={product.image}
                                            alt={getLocalizedText(product.name, product.engName)}
                                            width={400}
                                            height={400}
                                            className="w-auto h-full object-contain rounded-lg"
                                        />
                                    </div>
                                )}
                            </div>
                            {/* Toggle Button */}
                            <div className="text-center">
                                {product.modelPath ? (
                                    <button
                                        onClick={toggleView}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg shadow-sm bg-white border hover:bg-gray-50 transition-colors duration-300 cursor-pointer"
                                        title={showModel ? "画像を表示" : "3Dモデルに切り替え"}
                                    >
                                        {showModel ? (
                                            <>
                                                <Image
                                                    src={product.image}
                                                    alt={`${product.name} thumbnail`}
                                                    width={32}
                                                    height={32}
                                                    className="rounded opacity-70"
                                                />
                                                <span className="text-sm font-medium text-gray-600">画像</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-10 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center">
                                                    <svg
                                                        className="w-5 h-5 text-white"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm font-medium text-gray-600">3D Model</span>
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        width={100}
                                        height={80}
                                        className="inline-block rounded-lg shadow-sm opacity-60"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Related Products Section - Hidden on mobile, shown on desktop */}
                        <div className="hidden lg:block border-t border-gray-200 pt-8">
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

                    {/* Right Column - Product Info */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-4">
                                {getLocalizedText(product.name, product.engName)}
                            </h1>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                {getLocalizedText(product.description, product.engDescription)}
                            </p>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-xl text-gray-500">{locale === 'en' ? 'Price:' : '価格:'}</span>
                                <span className="text-2xl font-bold text-green-600">
                                    {product.price.toLocaleString(locale === 'en' ? 'en-US' : 'ja-JP')} &yen;
                                </span>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={(e) => handleAddToCart(product, e)}
                                    disabled={product.quantity === 0}
                                    className={`w-full flex-1 py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer ${product.quantity > 0
                                        ? 'bg-almond-6 hover:bg-almond-5 text-white'
                                        : 'hidden'
                                        }`}
                                >
                                    {product.quantity > 0 ? t('shopping.addToCartBtn') : t('shopping.soldOut')}
                                </button>

                                <button 
                                    onClick={(e) => {
                                        handleAddToCart(product, e);
                                        window.location.href = `/${locale}/cart`;
                                    }}
                                    disabled={product.quantity === 0}
                                    className={`w-full py-3 px-6 rounded-lg transition-colors duration-300 font-semibold cursor-pointer ${
                                        product.quantity > 0
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {product.quantity > 0 ? t('shopping.buyNow') : t('shopping.soldOut')}
                                </button>
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold mb-4">{t('shopping.productInfo')}</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{t('shopping.productCode')}:</span>
                                    <span className="font-medium">SP{product.id.toString().padStart(3, '0')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{t('shopping.stockStatus')}:</span>
                                    <span className={`font-medium ${getStockStatus(product.quantity).color}`}>{getStockStatus(product.quantity).text}</span>
                                </div>
                            </div>
                        </div>

                        {/* Ingredients */}
                        {((product.ingredients && product.ingredients.length > 0) || (product.engIngredients && product.engIngredients.length > 0)) && (
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold mb-4">{t('shopping.ingredients')}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {(locale === 'en' && product.engIngredients ? product.engIngredients : product.ingredients)?.map((ingredient, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                        >
                                            {ingredient}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Allergens */}
                        {((product.allergens && product.allergens.length > 0) || (product.engAllergens && product.engAllergens.length > 0)) && (
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold mb-4">{t('shopping.allergens')}</h3>
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h4 className="text-sm font-medium text-yellow-800">
                                                {t('shopping.allergensWarning')}
                                            </h4>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {(locale === 'en' && product.engAllergens ? product.engAllergens : product.allergens)?.map((allergen, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-medium"
                                                    >
                                                        {allergen}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products Section - Shown on mobile only */}
                <div className="lg:hidden mt-12 border-t border-gray-200 pt-8">
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
// export async function generateStaticParams() {
//     const { getAllProducts } = await import('@/lib/products');
//     const products = getAllProducts();

//     return products.map((product) => ({
//         id: product.id.toString(),
//     }));
// }
