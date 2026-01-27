'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/hooks/useCart';

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
  const { addToCart } = useCart();

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-2xl aspect-[4/5] mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
          </div>
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

  const handleAddToCart = (e: React.MouseEvent, product: FeaturedProduct) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: locale === 'en' ? product.engName : product.name,
      description: '', // Featured products don't have description
      price: product.price,
      image: product.image
    });
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
      {products.map((product) => (
        <div
          key={product.id}
          className="group cursor-pointer"
          onClick={() => router.push(`/products/${product.id}`)}
        >
          <div className="relative overflow-hidden rounded-3xl md:rounded-4xl bg-gray-50 aspect-[4/5] mb-4">
            {product.image && (
              <Image
                src={product.image}
                alt={locale === 'en' ? product.engName : product.name}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            )}
            {product.quantity < 10 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                {t('common.lowStock')}
              </div>
            )}
            <button
              onClick={(e) => handleAddToCart(e, product)}
              disabled={product.quantity === 0}
              className={`absolute bottom-3 right-3 backdrop-blur rounded-full px-[16px] py-[8px] shadow-sm transition-all transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 ${
                product.quantity > 0
                  ? 'bg-white/90 text-gray-900 hover:bg-cosmos-400 hover:text-white'
                  : 'bg-gray-400/90 text-gray-700 cursor-not-allowed'
              }`}
            >
              <span className="text-[20px] font-bold">+</span>
            </button>
          </div>
          <div className="flex flex-col">
            <h3 className="font-serif font-bold text-lg text-gray-900 leading-tight group-hover:text-cosmos-400 transition-colors line-clamp-2">
              {locale === 'en' ? product.engName : product.name}
            </h3>
            <p className="text-gray-600 mt-1 font-medium">
              &yen; {product.price.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
