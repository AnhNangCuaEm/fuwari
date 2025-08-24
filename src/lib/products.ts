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

// Get products by price range
export const getProductsByPriceRange = (minPrice: number, maxPrice: number): Product[] => {
    return productsData.filter(product => 
        product.price >= minPrice && product.price <= maxPrice
    );
};