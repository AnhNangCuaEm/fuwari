'use client';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

interface FavoriteProduct {
  id: number;
  name: string;
  engName: string;
  price: number;
  image: string;
  quantity: number;
}

export default function FavoriteProducts() {
  const [products, setProducts] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      try {
        const response = await fetch('/api/favorite-products');
        if (!response.ok) {
          throw new Error('Failed to fetch favorite products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching favorite products:', err);
        setError('Failed to load favorite products');
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteProducts();
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -350,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 350,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <section className="mt-20">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-serif font-bold text-gray-900">{t('home.favoriteProducts')}</h2>
          <div className="flex gap-2">
            <button className="size-10 rounded-full border border-gray-300 flex items-center justify-center opacity-50">
              <span>←</span>
            </button>
            <button className="size-10 rounded-full border border-gray-300 flex items-center justify-center opacity-50">
              <span>→</span>
            </button>
          </div>
        </div>
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-8 -mx-4 px-4 md:px-0 md:mx-0 snap-x">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="min-w-[280px] md:min-w-[300px] snap-center bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3 animate-pulse">
              <div className="aspect-square rounded-xl bg-gray-200"></div>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return null;
  }

  return (
    <section className="mt-20">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-serif font-bold text-text-main">{t('home.favoriteProducts')}</h2>
        <div className="flex gap-2">
          <button 
            onClick={scrollLeft}
            className="size-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white hover:shadow-sm transition"
          >
              <span>←</span>
          </button>
          <button 
            onClick={scrollRight}
            className="size-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white hover:shadow-sm transition"
          >
            <span>→</span>
          </button>
        </div>
      </div>
      <div 
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto no-scrollbar pb-8 -mx-4 px-4 md:px-0 md:mx-0 snap-x"
      >
        {products.map((product) => (
          <div 
            key={product.id} 
            className="min-w-[280px] md:min-w-[300px] snap-center bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3 cursor-pointer group"
            onClick={() => router.push(`/products/${product.id}`)}
          >
            <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden relative">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={locale === 'en' ? product.engName : product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-text-main group-hover:text-cosmos-400 transition-colors line-clamp-1">
                  {locale === 'en' ? product.engName : product.name}
                </h4>
                <p className="text-sm text-text-muted">
                  {product.quantity > 0 ? t('shopping.stock.inStock') : t('shopping.stock.outOfStock')}
                </p>
              </div>
              <span className="font-bold text-primary">¥{product.price.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
