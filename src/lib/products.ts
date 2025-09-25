import { Product } from '@/types/product';
import productsData from '../../data/products.json';

// Get all products
export const getAllProducts = (): Product[] => {
    return productsData;
};

// Get product by ID
export const getProductById = (id: number): Product | undefined => {
    return productsData.find(product => product.id === id);
};

// Get products by name (search)
export const searchProductsByName = (searchTerm: string): Product[] => {
    return productsData.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
};

// Comprehensive search function
export const searchProducts = (
    searchTerm?: string,
    minPrice?: number,
    maxPrice?: number
): Product[] => {
    return productsData.filter(product => {
        // Text search (name, English name, description)
        const matchesText = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.engName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.engDescription.toLowerCase().includes(searchTerm.toLowerCase());

        // Price range filter
        const matchesPrice = 
            (minPrice === undefined || product.price >= minPrice) &&
            (maxPrice === undefined || product.price <= maxPrice);

        return matchesText && matchesPrice;
    });
};

// Get products by price range
export const getProductsByPriceRange = (minPrice: number, maxPrice: number): Product[] => {
    return productsData.filter(product => 
        product.price >= minPrice && product.price <= maxPrice
    );
};