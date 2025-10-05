-- Fuwari Database Schema
-- Created for Docker MySQL setup
-- Based on existing JSON data structure

-- Drop tables if exists (for clean restart)
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `users`;

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE `users` (
  `id` VARCHAR(36) PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) DEFAULT NULL COMMENT 'Hashed password for credentials provider',
  `provider` ENUM('credentials', 'google', 'github') NOT NULL DEFAULT 'credentials',
  `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  `status` ENUM('active', 'inactive', 'banned') NOT NULL DEFAULT 'active',
  `phone` VARCHAR(20) DEFAULT NULL,
  `address` VARCHAR(500) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `postalCode` VARCHAR(20) DEFAULT NULL,
  `image` VARCHAR(500) DEFAULT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL COMMENT 'Japanese name',
  `engName` VARCHAR(255) NOT NULL COMMENT 'English name',
  `description` TEXT NOT NULL COMMENT 'Japanese description',
  `engDescription` TEXT NOT NULL COMMENT 'English description',
  `ingredients` JSON NOT NULL COMMENT 'Array of Japanese ingredients',
  `engIngredients` JSON NOT NULL COMMENT 'Array of English ingredients',
  `allergens` JSON NOT NULL COMMENT 'Array of Japanese allergens',
  `engAllergens` JSON NOT NULL COMMENT 'Array of English allergens',
  `price` INT NOT NULL COMMENT 'Price in Japanese Yen (no decimals)',
  `quantity` INT NOT NULL DEFAULT 0 COMMENT 'Stock quantity',
  `image` VARCHAR(500) NOT NULL COMMENT '2D image path',
  `modelPath` VARCHAR(500) NOT NULL COMMENT '3D model path',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_price` (`price`),
  INDEX `idx_quantity` (`quantity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE `orders` (
  `id` VARCHAR(36) PRIMARY KEY,
  `customerId` VARCHAR(36) DEFAULT NULL COMMENT 'References users.id - NULL for guest orders',
  `customerEmail` VARCHAR(255) NOT NULL,
  `items` JSON NOT NULL COMMENT 'Array of order items with product details',
  `subtotal` INT NOT NULL COMMENT 'Subtotal in Japanese Yen',
  `tax` INT NOT NULL DEFAULT 0 COMMENT 'Tax in Japanese Yen',
  `shipping` INT NOT NULL DEFAULT 0 COMMENT 'Shipping cost in Japanese Yen',
  `total` INT NOT NULL COMMENT 'Total in Japanese Yen',
  `status` ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  `stripePaymentIntentId` VARCHAR(255) DEFAULT NULL,
  `shippingAddress` JSON NOT NULL COMMENT 'Shipping address object',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_customerId` (`customerId`),
  INDEX `idx_customerEmail` (`customerEmail`),
  INDEX `idx_status` (`status`),
  INDEX `idx_createdAt` (`createdAt`),
  FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Insert sample data (optional - for testing)
-- =====================================================

-- Sample admin user
INSERT INTO `users` (`id`, `email`, `name`, `password`, `provider`, `role`, `status`, `phone`, `address`, `city`, `postalCode`, `image`) 
VALUES (
  'admin-001',
  'admin@fuwari.com',
  'Admin User',
  '$2b$12$kwQ0xm02zaUjhbiFqRoaauUy8zw.wUjktt9T50rycvVU4y29FpYKy', -- password: admin123
  'credentials',
  'admin',
  'active',
  '0901234567',
  'Tokyo',
  'Tokyo',
  '1000001',
  NULL
);

-- Sample regular user
INSERT INTO `users` (`id`, `email`, `name`, `password`, `provider`, `role`, `status`) 
VALUES (
  'user-001',
  'user@example.com',
  'Test User',
  '$2b$12$kwQ0xm02zaUjhbiFqRoaauUy8zw.wUjktt9T50rycvVU4y29FpYKy', -- password: user123
  'credentials',
  'user',
  'active'
);

-- Sample products
INSERT INTO `products` (`id`, `name`, `engName`, `description`, `engDescription`, `ingredients`, `engIngredients`, `allergens`, `engAllergens`, `price`, `quantity`, `image`, `modelPath`) 
VALUES 
(1, 'カップケーキ', 'Cupcake', 'バタークリームフロスティングの美味しいバニラカップケーキ。', 'Delicious vanilla cupcake with buttercream frosting.', 
 JSON_ARRAY('小麦粉', '砂糖', 'バター', '卵', 'バニラエッセンス', 'ベーキングパウダー', '塩', '牛乳'), 
 JSON_ARRAY('Flour', 'Sugar', 'Butter', 'Eggs', 'Vanilla Extract', 'Baking Powder', 'Salt', 'Milk'),
 JSON_ARRAY('小麦', '卵', '乳'),
 JSON_ARRAY('Wheat', 'Eggs', 'Dairy'),
 300, 50, '/2dimage/cupcake.webp', '/3dmodels/cupcake/scene.gltf'),

(2, 'ブラウニー', 'Brownie', 'くるみ入りの濃厚なチョコレートブラウニー。', 'Rich chocolate brownie with walnuts.',
 JSON_ARRAY('チョコレート', '小麦粉', '砂糖', 'バター', '卵', 'くるみ', 'ココアパウダー', 'バニラエッセンス'),
 JSON_ARRAY('Chocolate', 'Flour', 'Sugar', 'Butter', 'Eggs', 'Walnuts', 'Cocoa Powder', 'Vanilla Extract'),
 JSON_ARRAY('小麦', '卵', '乳', 'ナッツ'),
 JSON_ARRAY('Wheat', 'Eggs', 'Dairy', 'Nuts'),
 250, 30, '/2dimage/brownie.jpg', '/3dmodels/brownie/scene.gltf'),

(3, 'クッキー', 'Cookie', 'チョコチップ入りのサクサククッキー。', 'Crispy cookie with chocolate chips.',
 JSON_ARRAY('小麦粉', '砂糖', 'バター', '卵', 'チョコレートチップ', 'ベーキングソーダ', '塩', 'バニラエッセンス'),
 JSON_ARRAY('Flour', 'Sugar', 'Butter', 'Eggs', 'Chocolate Chips', 'Baking Soda', 'Salt', 'Vanilla Extract'),
 JSON_ARRAY('小麦', '卵', '乳'),
 JSON_ARRAY('Wheat', 'Eggs', 'Dairy'),
 200, 40, '/2dimage/cookie.webp', '/3dmodels/cookie/scene.gltf'),

(4, 'ストロベリーケーキ', 'Strawberry Cake', 'フレッシュストロベリーとクリームのケーキ。', 'Fresh strawberry cake with cream.',
 JSON_ARRAY('小麦粉', '砂糖', 'バター', '卵', 'イチゴ', '生クリーム', 'ベーキングパウダー', 'バニラエッセンス'),
 JSON_ARRAY('Flour', 'Sugar', 'Butter', 'Eggs', 'Strawberries', 'Heavy Cream', 'Baking Powder', 'Vanilla Extract'),
 JSON_ARRAY('小麦', '卵', '乳'),
 JSON_ARRAY('Wheat', 'Eggs', 'Dairy'),
 450, 20, '/2dimage/strawberrycake.jpg', '/3dmodels/strawberrycake/scene.gltf');

-- =====================================================
-- End of init.sql
-- =====================================================
