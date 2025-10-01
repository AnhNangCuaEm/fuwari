'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Product } from '@/types/product';
import { getAllProducts } from '@/lib/products';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type SortOption = 'newest' | 'price-low' | 'price-high' | 'relevance';

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const t = useTranslations();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('relevance');
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load products on mount
    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            try {
                const allProducts = getAllProducts();
                setProducts(allProducts);
            } catch (error) {
                console.error('Error loading products:', error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [isOpen]);

    // Filter and sort products based on search criteria
    const filteredAndSortedProducts = useMemo(() => {
        if (!products.length) return [];

        let filtered = products;

        // Text search (name or English name)
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(term) ||
                product.engName.toLowerCase().includes(term) ||
                product.description.toLowerCase().includes(term) ||
                product.engDescription.toLowerCase().includes(term)
            );
        }

        // Sort products
        const sorted = [...filtered];
        switch (sortBy) {
            case 'newest':
                sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
                break;
            case 'price-low':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'relevance':
            default:
                // Keep original order for relevance
                break;
        }

        return sorted;
    }, [products, searchTerm, sortBy]);

    const clearSearch = () => {
        setSearchTerm('');
        setSortBy('relevance');
    };

    const handleClose = () => {
        clearSearch();
        onClose();
    };

    const sortOptions = [
        { value: 'relevance', label: t('search.relevance') },
        { value: 'newest', label: t('search.newest') },
        { value: 'price-low', label: t('search.priceLowHigh') },
        { value: 'price-high', label: t('search.priceHighLow') }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[rgba(0,0,0,0.3)]"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-almond-1 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Search Controls */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="space-y-4">
                        <div className='flex justify-between'>
                            {/* Text Search */}
                            <div className='flex-1 mr-4'>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t('search.searchPlaceholder')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-almond-5 focus:border-transparent"
                                />
                            </div>

                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>

                        {/* Sort Filter Tags */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-700 mr-2">{t('search.sortBy')}:</span>
                            {sortOptions.map((option) => (
                                <p
                                    key={option.value}
                                    onClick={() => setSortBy(option.value as SortOption)}
                                    className={`px-3 py-1 text-sm rounded-full cursor-pointer transition-colors ${
                                        sortBy === option.value
                                            ? 'bg-almond-6 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {option.label}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="text-gray-500">{t('common.loading')}</div>
                        </div>
                    ) : filteredAndSortedProducts.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">
                                {searchTerm
                                    ? t('search.noResults')
                                    : t('search.startSearching')}
                            </p>
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="px-4 py-2 bg-[#CC8409] text-white rounded-md hover:bg-[#D69E2E] transition-colors cursor-pointer"
                                >
                                    {t('search.clearSearch')}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredAndSortedProducts.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/products/${product.id}`}
                                    onClick={handleClose}
                                    className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="aspect-square relative">
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                                            {product.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                                            {product.engName}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-green-600">
                                                ¥{product.price.toLocaleString()}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded ${product.quantity > 0
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {product.quantity > 0 ? t('shopping.stock.inStock') : t('shopping.stock.outOfStock')}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
