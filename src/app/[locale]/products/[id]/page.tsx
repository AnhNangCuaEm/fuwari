import React from 'react';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { getProductById, getRelatedProducts } from '@/lib/products';
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

    const relatedProducts = await getRelatedProducts(productId, product.price, 3);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="container max-w-7xl mx-auto px-4 pt-32 pb-16 flex-1">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <Link
                        href="/"
                        className="text-almond-6 hover:text-almond-8 mr-2"
                    >
                        {t('common.home')}
                    </Link>
                    <span className="text-almond-5 mr-2">/</span>
                    <Link
                        href="/products"
                        className="text-almond-6 hover:text-almond-8 mr-2"
                    >
                        {t('products.title')}
                    </Link>
                    <span className="text-almond-5 mr-2">/</span>
                    <span className="text-almond-8">{t('products.detail')}</span>
                </nav>

                <ProductDetailClient product={product} locale={locale} relatedProducts={relatedProducts} />

                {/* Related Products Section - Shown on mobile only */}
                <div className="lg:hidden mt-12 border-t border-almond-3 pt-8">
                    <h2 className="text-2xl font-bold mb-6 text-almond-11">{locale === 'en' ? 'Related Products' : '関連商品'}</h2>
                    {relatedProducts.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3">
                            {relatedProducts.map((related) => (
                                <Link
                                    key={related.id}
                                    href={`/${locale}/products/${related.id}`}
                                    className="group block bg-white rounded-lg shadow-sm border border-almond-3 overflow-hidden hover:shadow-md transition-shadow duration-300"
                                >
                                    <div className="aspect-square overflow-hidden bg-almond-1">
                                        <Image
                                            src={related.image}
                                            alt={locale === 'en' ? related.engName : related.name}
                                            width={200}
                                            height={200}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="p-2">
                                        <p className="text-xs font-medium text-almond-10 line-clamp-2 mb-1">
                                            {locale === 'en' ? related.engName : related.name}
                                        </p>
                                        <p className="text-xs font-bold text-cosmos-500">
                                            &yen;{related.price.toLocaleString()}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Link
                                href="/products"
                                className="inline-block bg-almond-2 text-almond-8 px-6 py-3 rounded-lg hover:bg-almond-3 transition-colors duration-300"
                            >
                                {locale === 'en' ? 'View all products' : 'すべての製品を見る'}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
