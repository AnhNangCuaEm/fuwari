'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

interface FeaturedProduct {
  id: number;
  name: string;
  engName: string;
  price: number;
  image: string;
  quantity: number;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('/api/featured-products');
        if (!response.ok) {
          throw new Error('Failed to fetch featured products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{error || t('home.noProducts')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-3xl corner shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
          onClick={() => router.push(`/products/${product.id}`)}
        >
          <div className="relative w-full h-64 bg-gray-100">
            {product.image && (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}
            {product.quantity < 10 && (
              <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {t('common.lowStock')}
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-2">
              {locale === 'en' ? product.engName : product.name}
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-[#fbcfd3]">
                ¥{product.price.toLocaleString()}
              </span>
              {/* <span className="text-sm text-gray-600">
                {t('common.stock')}: {product.quantity}
              </span> */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
