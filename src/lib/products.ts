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
            'SELECT * FROM products WHERE name ILIKE $1 ORDER BY created_at DESC',
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

        // Text search — use ILIKE for case-insensitive matching without needing a pg_trgm index
        if (searchTerm) {
            sql += ` AND (
                name ILIKE $${paramIndex} OR 
                "engName" ILIKE $${paramIndex + 1} OR 
                description ILIKE $${paramIndex + 2} OR 
                "engDescription" ILIKE $${paramIndex + 3}
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

// Get featured products (4 newest in-stock products)
export const getFeaturedProducts = async (): Promise<Product[]> => {
    try {
        const products = await query<(RowDataPacket & Product)[]>(
            'SELECT id, name, "engName", price, image, quantity FROM products WHERE quantity > 0 ORDER BY created_at DESC LIMIT 4'
        );
        return products;
    } catch (error) {
        console.error('Error fetching featured products:', error);
        return [];
    }
};

// Get popular/new products for the carousel (6 random in-stock products)
export const getFavoriteProducts = async (): Promise<Product[]> => {
    try {
        const products = await query<(RowDataPacket & Product)[]>(
            'SELECT id, name, "engName", price, image, quantity FROM products WHERE quantity > 0 ORDER BY RANDOM() LIMIT 6'
        );
        return products;
    } catch (error) {
        console.error('Error fetching popular products:', error);
        return [];
    }
};

// Get products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
    try {
        const products = await query<(RowDataPacket & Product)[]>(
            'SELECT * FROM products WHERE category = $1 ORDER BY created_at DESC',
            [category]
        );
        return products;
    } catch (error) {
        console.error('Error fetching products by category:', error);
        return [];
    }
};

// Get all unique categories
export const getAllCategories = async (): Promise<string[]> => {
    try {
        const result = await query<(RowDataPacket & { category: string })[]>(
            'SELECT DISTINCT category FROM products ORDER BY category ASC'
        );
        return result.map(row => row.category);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};

// Update product
export const updateProduct = async (
    id: number,
    data: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
): Promise<Product | null> => {
    try {
        const fields = Object.keys(data) as (keyof typeof data)[];
        if (fields.length === 0) return getProductById(id);

        const setClauses = fields.map((field, idx) => {
            const col = ['engName', 'engDescription', 'engIngredients', 'engAllergens', 'modelPath'].includes(field)
                ? `"${field}"`
                : field;
            return `${col} = $${idx + 1}`;
        });
        const values = fields.map(f => {
            const v = data[f];
            return Array.isArray(v) ? JSON.stringify(v) : v;
        });
        values.push(id);

        const sql = `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`;
        const updated = await queryOne<RowDataPacket & Product>(sql, values);
        return updated;
    } catch (error) {
        console.error('Error updating product:', error);
        return null;
    }
};

// Get related products by similar price (exclude current product)
export const getRelatedProducts = async (productId: number, price: number, limit = 3): Promise<Product[]> => {
    try {
        const products = await query<(RowDataPacket & Product)[]>(
            `SELECT id, name, "engName", price, image, quantity, "modelPath"
             FROM products
             WHERE id != $1
             ORDER BY ABS(price - $2) ASC
             LIMIT $3`,
            [productId, price, limit]
        );
        return products;
    } catch (error) {
        console.error('Error fetching related products:', error);
        return [];
    }
};

// Delete product
export const deleteProduct = async (id: number): Promise<boolean> => {
    try {
        await query('DELETE FROM products WHERE id = $1', [id]);
        return true;
    } catch (error) {
        console.error('Error deleting product:', error);
        return false;
    }
};