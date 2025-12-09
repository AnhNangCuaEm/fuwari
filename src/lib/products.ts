import { Product } from '@/types/product';
import { query, queryOne, RowDataPacket } from './db';

// Get all products
export const getAllProducts = async (): Promise<Product[]> => {
    try {
        const products = await query<(RowDataPacket & Product)[]>(
            'SELECT * FROM products ORDER BY created_at DESC'
        );
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
};

// Get product by ID
export const getProductById = async (id: number): Promise<Product | null> => {
    try {
        const product = await queryOne<RowDataPacket & Product>(
            'SELECT * FROM products WHERE id = $1',
            [id]
        );
        return product;
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        return null;
    }
};

// Get products by name (search)
export const searchProductsByName = async (searchTerm: string): Promise<Product[]> => {
    try {
        const products = await query<(RowDataPacket & Product)[]>(
            'SELECT * FROM products WHERE name LIKE $1 ORDER BY created_at DESC',
            [`%${searchTerm}%`]
        );
        return products;
    } catch (error) {
        console.error('Error searching products by name:', error);
        return [];
    }
};

// Comprehensive search function
export const searchProducts = async (
    searchTerm?: string,
    minPrice?: number,
    maxPrice?: number
): Promise<Product[]> => {
    try {
        let sql = 'SELECT * FROM products WHERE 1=1';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const params: any[] = [];
        let paramIndex = 1;

        // Text search
        if (searchTerm) {
            sql += ` AND (
                name LIKE $${paramIndex} OR 
                "engName" LIKE $${paramIndex + 1} OR 
                description LIKE $${paramIndex + 2} OR 
                "engDescription" LIKE $${paramIndex + 3}
            )`;
            const searchPattern = `%${searchTerm}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern);
            paramIndex += 4;
        }

        // Price range filter
        if (minPrice !== undefined) {
            sql += ` AND price >= $${paramIndex}`;
            params.push(minPrice);
            paramIndex++;
        }
        if (maxPrice !== undefined) {
            sql += ` AND price <= $${paramIndex}`;
            params.push(maxPrice);
            paramIndex++;
        }

        sql += ' ORDER BY created_at DESC';

        const products = await query<(RowDataPacket & Product)[]>(sql, params);
        return products;
    } catch (error) {
        console.error('Error searching products:', error);
        return [];
    }
};

// Get products by price range
export const getProductsByPriceRange = async (minPrice: number, maxPrice: number): Promise<Product[]> => {
    try {
        const products = await query<(RowDataPacket & Product)[]>(
            'SELECT * FROM products WHERE price >= $1 AND price <= $2 ORDER BY created_at DESC',
            [minPrice, maxPrice]
        );
        return products;
    } catch (error) {
        console.error('Error fetching products by price range:', error);
        return [];
    }
};