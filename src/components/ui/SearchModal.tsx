'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Product } from '@/types/product';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [mounted, setMounted] = useState(false);

    // Filter states
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    const [isIngredientDropdownOpen, setIsIngredientDropdownOpen] = useState(false);
    const ingredientDropdownRef = useRef<HTMLDivElement>(null);

    // Mount state for portal
    useEffect(() => {
        setMounted(true);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ingredientDropdownRef.current && !ingredientDropdownRef.current.contains(event.target as Node)) {
                setIsIngredientDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load products from API when modal opens
    useEffect(() => {
        if (isOpen && products.length === 0) {
            setIsLoading(true);
            fetch('/api/products')
                .then(res => res.json())
                .then(data => {
                    setProducts(data);
                })
                .catch(error => {
                    console.error('Error loading products:', error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [isOpen, products.length]);

    // Prevent body scroll when modal is open (iOS Safari fix)
    useEffect(() => {
        if (isOpen) {
            // Save current scroll position
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';

            return () => {
                // Restore scroll position
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

    // Extract unique ingredients from all products
    const availableIngredients = useMemo(() => {
        const ingredientSet = new Set<string>();
        products.forEach(product => {
            product.ingredients.forEach(ingredient => {
                ingredientSet.add(ingredient.toLowerCase().trim());
            });
        });
        return Array.from(ingredientSet).sort();
    }, [products]);

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

        // Price filter
        const min = minPrice ? parseFloat(minPrice) : null;
        const max = maxPrice ? parseFloat(maxPrice) : null;
        if (min !== null) {
            filtered = filtered.filter(product => product.price >= min);
        }
        if (max !== null) {
            filtered = filtered.filter(product => product.price <= max);
        }

        // Ingredients filter
        if (selectedIngredients.length > 0) {
            filtered = filtered.filter(product =>
                selectedIngredients.some(selectedIng =>
                    product.ingredients.some(ing =>
                        ing.toLowerCase().trim() === selectedIng
                    )
                )
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
    }, [products, searchTerm, sortBy, minPrice, maxPrice, selectedIngredients]);

    const clearSearch = () => {
        setSearchTerm('');
        setSortBy('relevance');
        setMinPrice('');
        setMaxPrice('');
        setSelectedIngredients([]);
    };

    const toggleIngredient = (ingredient: string) => {
        setSelectedIngredients(prev =>
            prev.includes(ingredient)
                ? prev.filter(i => i !== ingredient)
                : [...prev, ingredient]
        );
    };

    const hasActiveFilters = minPrice || maxPrice || selectedIngredients.length > 0;

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

    if (!mounted) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Animated Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[60] bg-black/30"
                        onClick={handleClose}
                    />

                    {/* Animated Modal Container */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ 
                            duration: 0.3, 
                            ease: [0.16, 1, 0.3, 1] // easeOutExpo
                        }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                    >
                        {/* Modal */}
                        <div className="relative bg-almond-1 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden pointer-events-auto">
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
                                className="p-2 hover:bg-gray-100 rounded-full"
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
                                    className={`px-3 py-1 text-sm rounded-full cursor-pointer transition-colors ${sortBy === option.value
                                            ? 'bg-almond-6 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    {option.label}
                                </p>
                            ))}
                        </div>

                        <div className='flex flex-wrap gap-4'>
                            {/* Price Range Filter */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-gray-700 mr-2">{t('search.priceRange')}:</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        placeholder={t('search.minPrice')}
                                        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-almond-5 focus:border-transparent"
                                        min="0"
                                    />
                                    <span className="text-gray-500">-</span>
                                    <input
                                        type="number"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        placeholder={t('search.maxPrice')}
                                        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-almond-5 focus:border-transparent"
                                        min="0"
                                    />
                                    <span className="text-gray-500 text-sm">&yen;</span>
                                </div>
                            </div>

                            {/* Ingredients Filter - Dropdown */}
                            {availableIngredients.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700 mr-2">{t('search.ingredients')}:</span>
                                    <div className="relative" ref={ingredientDropdownRef}>
                                        <button
                                            onClick={() => setIsIngredientDropdownOpen(!isIngredientDropdownOpen)}
                                            className={`px-3 py-1.5 text-sm rounded-md border transition-colors flex items-center gap-2 ${selectedIngredients.length > 0
                                                    ? 'bg-almond-6 text-white border-almond-6'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span>
                                                {selectedIngredients.length > 0
                                                    ? `${selectedIngredients.length} ${t('search.selected')}`
                                                    : t('search.selectIngredients')}
                                            </span>
                                            <svg
                                                className={`w-4 h-4 transition-transform ${isIngredientDropdownOpen ? 'rotate-180' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {/* Dropdown Menu */}
                                        {isIngredientDropdownOpen && (
                                            <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                <div className="p-2">
                                                    {availableIngredients.map((ingredient) => (
                                                        <label
                                                            key={ingredient}
                                                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIngredients.includes(ingredient)}
                                                                onChange={() => toggleIngredient(ingredient)}
                                                                className="w-4 h-4 text-almond-6 border-gray-300 rounded focus:ring-almond-5"
                                                            />
                                                            <span className="text-sm text-gray-700 capitalize">{ingredient}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                {selectedIngredients.length > 0 && (
                                                    <div className="border-t border-gray-200 p-2">
                                                        <button
                                                            onClick={() => setSelectedIngredients([])}
                                                            className="w-full text-sm text-center text-almond-6 hover:text-almond-7"
                                                        >
                                                            {t('search.clearSelection')}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected ingredients tags */}
                                    {selectedIngredients.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {selectedIngredients.map((ingredient) => (
                                                <span
                                                    key={ingredient}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-almond-2 text-almond-7 rounded-full capitalize"
                                                >
                                                    {ingredient}
                                                    <button
                                                        onClick={() => toggleIngredient(ingredient)}
                                                        className="hover:text-almond-9"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>


                        {/* Clear Filters Button */}
                        {hasActiveFilters && (
                            <div className="flex justify-end">
                                <button
                                    onClick={() => {
                                        setMinPrice('');
                                        setMaxPrice('');
                                        setSelectedIngredients([]);
                                    }}
                                    className="text-sm text-almond-6 hover:text-almond-7 underline"
                                >
                                    {t('search.clearFilters')}
                                </button>
                            </div>
                        )}
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
                                {(searchTerm || hasActiveFilters)
                                    ? t('search.noResults')
                                    : t('search.startSearching')}
                            </p>
                            {(searchTerm || hasActiveFilters) && (
                                <button
                                    onClick={clearSearch}
                                    className="px-4 py-2 bg-[#CC8409] text-white rounded-md hover:bg-[#D69E2E] transition-colors"
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
                                    className="relative flex flex-col bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden h-80"
                                >
                                    {/* Background Image */}
                                    <div className="absolute inset-0">
                                        <Image
                                            src={product.image}
                                            alt={`${product.name} (${product.engName})`}
                                            fill
                                            className="object-cover rounded-xl"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                    </div>

                                    {/* Product Info Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 rounded-lg flex flex-col justify-between p-3 bg-white/50 backdrop-blur-sm">
                                        <h3 className="text-lg font-semibold mb-2 text-gray-900">
                                            {product.name}
                                        </h3>
                                        <p className="text-xs text-gray-800 mb-2 line-clamp-1">
                                            {product.engName}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-green-600">
                                                &yen;{product.price.toLocaleString()}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded ${product.quantity > 0
                                                ? 'bg-green-100/80 text-green-800'
                                                : 'bg-red-100/80 text-red-800'
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
            </motion.div>
                </>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}
