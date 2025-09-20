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
import { useTranslations } from 'next-intl';


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

    const handleAddToCart = (product: Product, e: React.MouseEvent) => {
        e.preventDefault() // Prevent the Link navigation
        addToCart({
            id: product.id,
            name: product.name,
            description: product.description,
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
            return { text: '在庫なし', color: 'text-red-600' };
        } else if (quantity < 10) {
            return { text: '残りわずか', color: 'text-orange-500' };
        } else {
            return { text: '在庫あり', color: 'text-green-600' };
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="container mx-auto px-4 py-8 flex-1">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <Link
                        href="/products"
                        className="btn text-white hover:bg-gray-700"
                    >
                        {t("breadcrumb.products")}
                    </Link>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product 3D Model */}
                    <div className="space-y-4">
                        <div className="overflow-hidden rounded-lg shadow-lg bg-white">
                            {product.modelPath && showModel ? (
                                <ModelViewer
                                    modelPath={product.modelPath}
                                    className="w-full h-96"
                                />
                            ) : (
                                <div className="w-full h-96 flex items-center justify-center bg-gray-100">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        width={384}
                                        height={384}
                                        className="max-w-full max-h-full object-contain rounded-lg"
                                    />
                                </div>
                            )}
                        </div>
                        {/* Toggle Button */}
                        <div className="text-center">
                            {product.modelPath ? (
                                <button
                                    onClick={toggleView}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg shadow-sm bg-white border hover:bg-gray-50 transition-colors duration-300"
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
                                <span className="text-sm text-gray-500">価格:</span>
                                <span className="text-3xl font-bold text-green-600">
                                    {product.price.toLocaleString('ja-JP')} &yen;
                                </span>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={(e) => handleAddToCart(product, e)}
                                    disabled={product.quantity === 0}
                                    className={`w-full flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${product.quantity > 0
                                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {product.quantity > 0 ? 'カートに追加' : '売り切れ'}
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
                                    <span className={`font-medium ${getStockStatus(product.quantity).color}`}>{getStockStatus(product.quantity).text}</span>
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
// export async function generateStaticParams() {
//     const { getAllProducts } = await import('@/lib/products');
//     const products = getAllProducts();

//     return products.map((product) => ({
//         id: product.id.toString(),
//     }));
// }
