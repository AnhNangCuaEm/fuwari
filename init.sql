-- Fuwari Database Schema
-- Created for Docker PostgreSQL setup
-- Based on existing JSON data structure

-- Create custom ENUM types
DROP TYPE IF EXISTS user_provider CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;

CREATE TYPE user_provider AS ENUM ('credentials', 'google', 'github');
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'banned');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled');

-- Drop tables if exists (for clean restart)
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) DEFAULT NULL, -- Hashed password for credentials provider
    provider user_provider NOT NULL DEFAULT 'credentials',
    role user_role NOT NULL DEFAULT 'user',
    status user_status NOT NULL DEFAULT 'active',
    phone VARCHAR(20) DEFAULT NULL,
    address VARCHAR(500) DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    "postalCode" VARCHAR(20) DEFAULT NULL,
    image VARCHAR(500) DEFAULT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_status ON users (status);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL, -- Japanese name
    "engName" VARCHAR(255) NOT NULL, -- English name
    description TEXT NOT NULL, -- Japanese description
    "engDescription" TEXT NOT NULL, -- English description
    ingredients JSONB NOT NULL, -- Array of Japanese ingredients
    "engIngredients" JSONB NOT NULL, -- Array of English ingredients
    allergens JSONB NOT NULL, -- Array of Japanese allergens
    "engAllergens" JSONB NOT NULL, -- Array of English allergens
    "category" VARCHAR(50) NOT NULL, -- Product category
    price INT NOT NULL, -- Price in Japanese Yen (no decimals)
    quantity INT NOT NULL DEFAULT 0, -- Stock quantity
    image VARCHAR(500) NOT NULL, -- 2D image path
    "modelPath" VARCHAR(500) NOT NULL, -- 3D model path
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_price ON products (price);
CREATE INDEX idx_products_quantity ON products (quantity);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    "customerId" VARCHAR(36) DEFAULT NULL, -- References users.id - NULL for guest orders
    "customerEmail" VARCHAR(255) NOT NULL,
    items JSONB NOT NULL, -- Array of order items with product details
    subtotal INT NOT NULL, -- Subtotal in Japanese Yen
    tax INT NOT NULL DEFAULT 0, -- Tax in Japanese Yen
    shipping INT NOT NULL DEFAULT 0, -- Shipping cost in Japanese Yen
    total INT NOT NULL, -- Total in Japanese Yen
    status order_status NOT NULL DEFAULT 'pending',
    "stripePaymentIntentId" VARCHAR(255) DEFAULT NULL,
    "shippingAddress" JSONB NOT NULL, -- Shipping address object
    "deliveryDate" VARCHAR(255) NOT NULL, -- Scheduled delivery date in ISO format
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("customerId") REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX idx_orders_customerId ON orders ("customerId");
CREATE INDEX idx_orders_customerEmail ON orders ("customerEmail");
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_createdAt ON orders ("createdAt");
CREATE INDEX idx_orders_deliveryDate ON orders ("deliveryDate");

-- =====================================================
-- Create trigger function for updating timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_updated_at_column_snake()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column_snake();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Insert sample data (optional - for testing)
-- =====================================================
-- Sample admin user
INSERT INTO users (
    id, email, name, password, provider, role, status,
    phone, address, city, "postalCode", image
) VALUES (
    'admin-001',
    'admin@fuwari.com',
    'Admin User',
    '$2b$12$kwQ0xm02zaUjhbiFqRoaauUy8zw.wUjktt9T50rycvVU4y29FpYKy', -- password: abc123123
    'credentials',
    'admin',
    'active',
    '0901234567',
    'Tokyo',
    'Tokyo',
    '1000001',
    NULL
);

INSERT INTO users (
    id, email, name, password, provider, role, status,
    phone, address, city, "postalCode", image
) VALUES (
    'admin-002',
    'abc@gmail.com',
    'Admin User',
    '$2b$12$kwQ0xm02zaUjhbiFqRoaauUy8zw.wUjktt9T50rycvVU4y29FpYKy', -- password: abc123123
    'credentials',
    'admin',
    'active',
    '0901234567',
    'Tokyo',
    'Shibuya',
    '1000001',
    NULL
);

-- Sample regular user
INSERT INTO users (
    id, email, name, password, provider, role, status
) VALUES (
    'user-001',
    'user@example.com',
    'Test User',
    '$2b$12$kwQ0xm02zaUjhbiFqRoaauUy8zw.wUjktt9T50rycvVU4y29FpYKy', -- password: abc123123
    'credentials',
    'user',
    'active'
);

-- Sample order for admin user
INSERT INTO orders (
    id, "customerId", "customerEmail", items, subtotal, tax, shipping,
    total, status, "stripePaymentIntentId", "shippingAddress", "deliveryDate",
    "createdAt", "updatedAt"
) VALUES (
    '93894728-6e83-47b4-a698-2787f15903a2',
    'admin-002',
    'abc@gmail.com',
    '[
        {
            "id": 1,
            "name": "カップケーキ",
            "image": "/2dimage/cupcake.webp",
            "price": 300,
            "quantity": 3,
            "description": "バタークリームフロスティングの美味しいバニラカップケーキ。"
        },
        {
            "id": 4,
            "name": "ストロベリーケーキ",
            "image": "/2dimage/strawberrycake.jpg",
            "price": 450,
            "quantity": 3,
            "description": "フレッシュストロベリーとクリームのケーキ。"
        },
        {
            "id": 2,
            "name": "ブラウニー",
            "image": "/2dimage/brownie.jpg",
            "price": 250,
            "quantity": 1,
            "description": "くるみ入りの濃厚なチョコレートブラウニー。"
        }
    ]'::jsonb,
    2500,
    250,
    0,
    2750,
    'paid',
    'pi_3SFQRMQqfHK6HPqv1UBX3XVQ',
    '{
        "city": "Tokyo",
        "email": "abc@gmail.com",
        "phone": "0901234567",
        "address": "Tokyo",
        "country": "JP",
        "fullName": "Admin user",
        "postalCode": "1000001"
    }'::jsonb,
    '2025-10-07',
    '2025-10-07 11:15:49',
    '2025-10-07 11:15:49'
);

-- Sample products
INSERT INTO products (
    id, name, "engName", description, "engDescription",
    ingredients, "engIngredients", allergens, "engAllergens", "category",
    price, quantity, image, "modelPath"
) VALUES
(
    1,
    'カップケーキ',
    'Cupcake',
    'バタークリームフロスティングの美味しいバニラカップケーキ。',
    'Delicious vanilla cupcake with buttercream frosting.',
    '["小麦粉", "砂糖", "バター", "卵", "バニラエッセンス", "ベーキングパウダー", "塩", "牛乳"]'::jsonb,
    '["Flour", "Sugar", "Butter", "Eggs", "Vanilla Extract", "Baking Powder", "Salt", "Milk"]'::jsonb,
    '["小麦", "卵", "乳"]'::jsonb,
    '["Wheat", "Eggs", "Dairy"]'::jsonb,
    'cakes',
    300,
    50,
    '/2dimage/cupcake.webp',
    '/3dmodels/cupcake/scene.gltf'
),
(
    2,
    'ブラウニー',
    'Brownie',
    'くるみ入りの濃厚なチョコレートブラウニー。',
    'Rich chocolate brownie with walnuts.',
    '["チョコレート", "小麦粉", "砂糖", "バター", "卵", "くるみ", "ココアパウダー", "バニラエッセンス"]'::jsonb,
    '["Chocolate", "Flour", "Sugar", "Butter", "Eggs", "Walnuts", "Cocoa Powder", "Vanilla Extract"]'::jsonb,
    '["小麦", "卵", "乳", "ナッツ"]'::jsonb,
    '["Wheat", "Eggs", "Dairy", "Nuts"]'::jsonb,
    'cakes',
    250,
    30,
    '/2dimage/brownie.jpg',
    '/3dmodels/brownie/scene.gltf'
),
(
    3,
    'クッキー',
    'Cookie',
    'チョコチップ入りのサクサククッキー。',
    'Crispy cookie with chocolate chips.',
    '["小麦粉", "砂糖", "バター", "卵", "チョコレートチップ", "ベーキングソーダ", "塩", "バニラエッセンス"]'::jsonb,
    '["Flour", "Sugar", "Butter", "Eggs", "Chocolate Chips", "Baking Soda", "Salt", "Vanilla Extract"]'::jsonb,
    '["小麦", "卵", "乳"]'::jsonb,
    '["Wheat", "Eggs", "Dairy"]'::jsonb,
    'cookies',
    200,
    40,
    '/2dimage/cookie.webp',
    '/3dmodels/cookie/scene.gltf'
),
(
    4,
    'ストロベリーケーキ',
    'Strawberry Cake',
    'フレッシュストロベリーとクリームのケーキ。',
    'Fresh strawberry cake with cream.',
    '["小麦粉", "砂糖", "バター", "卵", "イチゴ", "生クリーム", "ベーキングパウダー", "バニラエッセンス"]'::jsonb,
    '["Flour", "Sugar", "Butter", "Eggs", "Strawberries", "Heavy Cream", "Baking Powder", "Vanilla Extract"]'::jsonb,
    '["小麦", "卵", "乳"]'::jsonb,
    '["Wheat", "Eggs", "Dairy"]'::jsonb,
    'cakes',
    450,
    20,
    '/2dimage/strawberrycake.jpg',
    '/3dmodels/strawberrycake/scene.gltf'
),
(
    5,
    '誕生ケーキ',
    'Birthday Cake',
    'フルーツとクリームの豪華な誕生ケーキ。',
    'Luxurious birthday cake with fruits and cream.',
    '["小麦粉", "砂糖", "バター", "卵", "フルーツミックス", "生クリーム", "ベーキングパウダー", "バニラエッセンス"]'::jsonb,
    '["Flour", "Sugar", "Butter", "Eggs", "Mixed Fruits", "Heavy Cream", "Baking Powder", "Vanilla Extract"]'::jsonb,
    '["小麦", "卵", "乳", "ナッツ"]'::jsonb,
    '["Wheat", "Eggs", "Dairy", "Nuts"]'::jsonb,
    'original',
    1200,
    30,
    '/2dimage/birthdaycake.jpg',
    '/3dmodels/birthdaycake/scene.gltf'
),
(
    6,
    'パーティーケーキ',
    'Party Cake',
    'フルーツとクリームの豪華なパーティーケーキ。',
    'Luxurious party cake with fruits and cream.',
    '["小麦粉", "砂糖", "バター", "卵", "フルーツミックス", "生クリーム", "ベーキングパウダー", "バニラエッセンス"]'::jsonb,
    '["Flour", "Sugar", "Butter", "Eggs", "Mixed Fruits", "Heavy Cream", "Baking Powder", "Vanilla Extract"]'::jsonb,
    '["小麦", "卵", "乳", "ナッツ"]'::jsonb,
    '["Wheat", "Eggs", "Dairy", "Nuts"]'::jsonb,
    'original',
    800,
    25,
    '/2dimage/partycake.jpg',
    '/3dmodels/partycake/scene.gltf'
),
(
    7,
    'チョコレートクッキー',
    'Chocolate Cookie',
    '濃厚なチョコレートクッキー。',
    'Rich chocolate cookie.',
    '["小麦粉", "砂糖", "バター", "卵", "ココアパウダー", "チョコレートチップ", "ベーキングソーダ", "塩", "バニラエッセンス"]'::jsonb,
    '["Flour", "Sugar", "Butter", "Eggs", "Cocoa Powder", "Chocolate Chips", "Baking Soda", "Salt", "Vanilla Extract"]'::jsonb,
    '["小麦", "卵", "乳"]'::jsonb,
    '["Wheat", "Eggs", "Dairy"]'::jsonb,
    'cookies',
    600,
    40,
    '/2dimage/chococookie.jpg',
    '/3dmodels/chococookie/scene.gltf'
),
(
    8,
    'パンケーキ',
    'Pancake',
    'ふわふわのパンケーキ。',
    'Fluffy pancake.',
    '["小麦粉", "砂糖", "バター", "卵", "牛乳", "ベーキングパウダー", "塩", "バニラエッセンス"]'::jsonb,
    '["Flour", "Sugar", "Butter", "Eggs", "Milk", "Baking Powder", "Salt", "Vanilla Extract"]'::jsonb,
    '["小麦", "卵", "乳"]'::jsonb,
    '["Wheat", "Eggs", "Dairy"]'::jsonb,
    'original',
    300,
    20,
    '/2dimage/pancake.png',
    '/3dmodels/pancake/scene.gltf'
),
(
    9,
    'ドーナツ',
    'Donut',
    '甘いドーナツ。',
    'Sweet glazed donut.',
    '["小麦粉", "砂糖", "バター", "卵", "牛乳", "ベーキングパウダー", "塩", "バニラエッセンス", "グレーズ"]'::jsonb,
    '["Flour", "Sugar", "Butter", "Eggs", "Milk", "Baking Powder", "Salt", "Vanilla Extract", "Glaze"]'::jsonb,
    '["小麦", "卵", "乳"]'::jsonb,
    '["Wheat", "Eggs", "Dairy"]'::jsonb,
    'cakes',
    350,
    25,
    '/2dimage/donut.png',
    '/3dmodels/donut/scene.gltf'
);

-- Reset sequence for products table
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- =====================================================
-- End of init.sql
-- =====================================================