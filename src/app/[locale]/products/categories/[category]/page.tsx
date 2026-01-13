import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { getProductsByCategory } from '@/lib/products';
import { Product } from '@/types/product';
import { getTranslations, getLocale } from 'next-intl/server';
import AddToCartButton from '@/components/products/AddToCartButton';

// Valid categories
const VALID_CATEGORIES = ['cakes', 'cookies', 'macarons', 'original'] as const;
type CategoryType = typeof VALID_CATEGORIES[number];

// Use dynamic rendering since we fetch from database
export const dynamic = 'force-dynamic';

// Category display info
const categoryInfo: Record<CategoryType, { titleEn: string; titleJa: string; image: string }> = {
    cakes: { titleEn: 'Cakes', titleJa: 'ケーキ', image: '/images/categories_section/cakes.png' },
    cookies: { titleEn: 'Cookies', titleJa: 'クッキー', image: '/images/categories_section/cookies.png' },
    macarons: { titleEn: 'Macarons', titleJa: 'マカロン', image: '/images/categories_section/macaron.png' },
    original: { titleEn: 'Original Sweets', titleJa: 'オリジナルスイーツ', image: '/images/categories_section/sweets.png' },
};

interface PageProps {
    params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
    const { category } = await params;
    
    // Validate category
    if (!VALID_CATEGORIES.includes(category as CategoryType)) {
        notFound();
    }

    const validCategory = category as CategoryType;
    const products = await getProductsByCategory(validCategory);
    const t = await getTranslations();
    const locale = await getLocale();

    const info = categoryInfo[validCategory];
    const categoryTitle = locale === 'en' ? info.titleEn : info.titleJa;

    // Helper function to get localized text
    const getLocalizedText = (jaText: string, enText: string) => {
        return locale === 'en' ? enText : jaText;
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="container mx-auto px-4 pt-32 pb-16 flex-1">
                {/* Breadcrumb */}
                <nav className="mb-4">
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
                    <span className="text-gray-700">{categoryTitle}</span>
                </nav>

                {/* Category Header */}
                <div className="relative w-full h-48 md:h-64 rounded-3xl overflow-hidden mb-8">
                    <Image
                        src={info.image}
                        alt={categoryTitle}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white">
                            {categoryTitle}
                        </h1>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product: Product) => (
                        <div
                            key={product.id}
                            className="relative group flex flex-col bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-80"
                        >
                            {/* Background Image */}
                            <Link href={`/products/${product.id}`} className="absolute inset-0">
                                <Image
                                    src={product.image}
                                    alt={getLocalizedText(product.name, product.engName)}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
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

                {/* Empty State */}
                {products.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg mb-4">
                            {locale === 'en' 
                                ? 'No products available in this category' 
                                : 'このカテゴリーには商品がありません'}
                        </p>
                        <Link 
                            href="/products" 
                            className="text-almond-6 hover:text-almond-8 underline"
                        >
                            {locale === 'en' ? 'View all products' : 'すべての商品へ'}
                        </Link>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
