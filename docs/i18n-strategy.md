# I18n Strategy for Fuwari Sweet Shop

## Hybrid Approach - Translation Separation

### 1. Static Translations (messages/ folder)

```json
// messages/en.json
{
  "common": { ... },
  "ui": {
    "productCard": {
      "addToCart": "Add to Cart",
      "viewDetails": "View Details",
      "price": "Price",
      "stock": "Stock"
    }
  }
}
```

### 2. Dynamic Content (Database)

```sql
-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name_en VARCHAR(255),
  name_ja VARCHAR(255),
  description_en TEXT,
  description_ja TEXT,
  price DECIMAL(10,2),
  image_url VARCHAR(255),
  model_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Or separate translations table (more flexible)
CREATE TABLE product_translations (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  locale VARCHAR(5),
  field_name VARCHAR(50), -- 'name', 'description'
  field_value TEXT,
  INDEX(product_id, locale)
);
```

### 3. Implementation Pattern

```typescript
// lib/products.ts
export async function getProduct(id: string, locale: string) {
  // Get basic data from DB
  const product = await db.product.findUnique({ where: { id } });

  // Get translations from DB
  const translations = await db.productTranslation.findMany({
    where: { productId: id, locale },
  });

  return {
    ...product,
    name: translations.find((t) => t.fieldName === "name")?.fieldValue,
    description: translations.find((t) => t.fieldName === "description")
      ?.fieldValue,
  };
}
```

## Benefits of Hybrid Approach:

✅ **Performance**: Static UI translations load quickly
✅ **Scalability**: Dynamic content doesn't slow down app
✅ **Maintainability**: Easy to manage with many products
✅ **Flexibility**: Can add/edit translations via admin panel
✅ **Caching**: Can cache dynamic translations

## Implementation Steps:

1. **Migrate existing products to DB**
2. **Setup translation tables**
3. **Create helper functions**
4. **Update components to use dynamic translations**
5. \*\*Add admin interface for translation
