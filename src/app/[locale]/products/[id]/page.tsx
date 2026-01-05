import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { getProductById } from '@/lib/products';
import { getTranslations, getLocale } from 'next-intl/server';
import ProductDetailClient from './ProductDetailClient';

interface ProductDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);
    const product = await getProductById(productId);
    const t = await getTranslations();
    const locale = await getLocale();

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="container mx-auto px-4 pt-32 pb-16 flex-1">
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

                <ProductDetailClient product={product} locale={locale} />

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
