CREATE TABLE `genres` (
	`id` INTEGER NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(255) NOT NULL,
	`parent_genre_id` INTEGER DEFAULT null,
	PRIMARY KEY(`id`)
);


CREATE TABLE `ingredients` (
	`id` INTEGER NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(255) NOT NULL,
	`description` TEXT NOT NULL,
	`eng_description` TEXT NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE `users` (
	`id` INTEGER NOT NULL AUTO_INCREMENT,
	`status` ENUM('active', 'deactivated', 'banned') NOT NULL DEFAULT 'active',
	`name` VARCHAR(255) NOT NULL,
	`email` VARCHAR(255) NOT NULL,
	`phone` VARCHAR(20) NOT NULL,
	`password_hash` VARCHAR(255) NOT NULL COMMENT 'Lưu mật khẩu đã được hash',
	`role` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
	`created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(`id`)
);


CREATE TABLE `user_addresses` (
	`id` INTEGER NOT NULL AUTO_INCREMENT,
	`user_id` INTEGER NOT NULL,
	`recipient_name` VARCHAR(255) NOT NULL,
	`phone_number` VARCHAR(20) NOT NULL,
	`address` VARCHAR(255) NOT NULL,
	`is_default` BOOLEAN NOT NULL DEFAULT false,
	PRIMARY KEY(`id`)
);


CREATE TABLE `products` (
	`id` INTEGER NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(255) NOT NULL,
	`eng_name` VARCHAR(255) NOT NULL,
	`description` TEXT NOT NULL,
	`eng_description` TEXT NOT NULL,
	`price` DECIMAL(12,2) NOT NULL,
	`stock_quantity` INTEGER NOT NULL DEFAULT 0,
	`genre_id` INTEGER NOT NULL,
	`3d_model` VARCHAR(255) NOT NULL,
	`is_published` ENUM('active', 'inactive', 'archived') NOT NULL DEFAULT 'active',
	`created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TIMESTAMP NOT NULL,
	`sale_price` DECIMAL(10,2) DEFAULT null,
	PRIMARY KEY(`id`)
);


CREATE TABLE `product_images` (
	`id` INTEGER NOT NULL AUTO_INCREMENT,
	`product_id` INTEGER NOT NULL,
	`is_primary` BOOLEAN NOT NULL DEFAULT false,
	`image_url` VARCHAR(2048) NOT NULL,
	`alt_text` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE `product_ingredients` (
	`id` INTEGER NOT NULL AUTO_INCREMENT,
	`product_id` INTEGER NOT NULL,
	`ingredient_id` INTEGER NOT NULL,
	`amount` VARCHAR(100) NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE `orders` (
	`id` INTEGER NOT NULL AUTO_INCREMENT,
	`user_id` INTEGER NOT NULL,
	`order_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`status` ENUM('preparing', 'shipped', 'arrived', 'completed', 'canceled') NOT NULL DEFAULT 'preparing',
	`subtotal` DECIMAL(12,2) NOT NULL,
	`shipping_fee` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
	`discount_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
	`tax_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
	`total_price` DECIMAL(12,2) NOT NULL,
	`shipping_name` VARCHAR(255) NOT NULL,
	`shipping_phone` VARCHAR(20) NOT NULL,
	`shipping_address` VARCHAR(500) NOT NULL,
	`payment_method` VARCHAR(100) NOT NULL,
	`updated_at` TIMESTAMP NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE `order_items` (
	`id` INTEGER NOT NULL AUTO_INCREMENT,
	`order_id` INTEGER NOT NULL,
	`product_id` INTEGER NOT NULL,
	`quantity` INTEGER NOT NULL,
	`price` DECIMAL(12,2) NOT NULL COMMENT 'Giá sản phẩm tại thời điểm mua',
	PRIMARY KEY(`id`)
);


CREATE TABLE `reviews` (
	`id` INTEGER NOT NULL AUTO_INCREMENT,
	`product_id` INTEGER NOT NULL,
	`user_id` INTEGER NOT NULL,
	`rating` INTEGER NOT NULL,
	`comment` TEXT NOT NULL,
	`status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
	`created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TIMESTAMP NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE `notifications` (
	`id` INTEGER NOT NULL AUTO_INCREMENT,
	`title` VARCHAR(255) NOT NULL,
	`message` TEXT NOT NULL,
	`created_by` INTEGER NOT NULL,
	`created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`status` ENUM('draft', 'sent') NOT NULL DEFAULT 'draft',
	PRIMARY KEY(`id`)
);


CREATE TABLE `notification_recipients` (
	`id` INTEGER NOT NULL AUTO_INCREMENT,
	`notification_id` INTEGER NOT NULL,
	`user_id` INTEGER NOT NULL,
	`sent_at` TIMESTAMP NOT NULL,
	`is_read` BOOLEAN NOT NULL DEFAULT false,
	PRIMARY KEY(`id`)
);


CREATE TABLE `support_tickets` (
	`id` INTEGER NOT NULL AUTO_INCREMENT,
	`user_id` INTEGER NOT NULL,
	`title` VARCHAR(255) NOT NULL,
	`content` TEXT NOT NULL,
	`created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`status` ENUM('unread', 'pending', 'closed') NOT NULL DEFAULT 'unread',
	PRIMARY KEY(`id`)
);


CREATE TABLE `ticket_messages` (
	`id` INTEGER NOT NULL AUTO_INCREMENT,
	`ticket_id` INTEGER NOT NULL,
	`sender_id` INTEGER NOT NULL,
	`message` TEXT NOT NULL,
	`created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(`id`)
);


ALTER TABLE `user_addresses`
ADD FOREIGN KEY(`user_id`) REFERENCES `users`(`id`)
ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `products`
ADD FOREIGN KEY(`genre_id`) REFERENCES `genres`(`id`)
ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE `product_images`
ADD FOREIGN KEY(`product_id`) REFERENCES `products`(`id`)
ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `product_ingredients`
ADD FOREIGN KEY(`product_id`) REFERENCES `products`(`id`)
ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `product_ingredients`
ADD FOREIGN KEY(`ingredient_id`) REFERENCES `ingredients`(`id`)
ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE `orders`
ADD FOREIGN KEY(`user_id`) REFERENCES `users`(`id`)
ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE `order_items`
ADD FOREIGN KEY(`order_id`) REFERENCES `orders`(`id`)
ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `order_items`
ADD FOREIGN KEY(`product_id`) REFERENCES `products`(`id`)
ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE `reviews`
ADD FOREIGN KEY(`product_id`) REFERENCES `products`(`id`)
ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `reviews`
ADD FOREIGN KEY(`user_id`) REFERENCES `users`(`id`)
ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `notifications`
ADD FOREIGN KEY(`created_by`) REFERENCES `users`(`id`)
ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE `notification_recipients`
ADD FOREIGN KEY(`notification_id`) REFERENCES `notifications`(`id`)
ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `notification_recipients`
ADD FOREIGN KEY(`user_id`) REFERENCES `users`(`id`)
ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `support_tickets`
ADD FOREIGN KEY(`user_id`) REFERENCES `users`(`id`)
ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `ticket_messages`
ADD FOREIGN KEY(`ticket_id`) REFERENCES `support_tickets`(`id`)
ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `ticket_messages`
ADD FOREIGN KEY(`sender_id`) REFERENCES `users`(`id`)
ON UPDATE CASCADE ON DELETE NO ACTION;
ALTER TABLE `genres`
ADD FOREIGN KEY(`parent_genre_id`) REFERENCES `genres`(`id`)
ON UPDATE NO ACTION ON DELETE SET NULL;