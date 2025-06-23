CREATE TABLE `products` (
	`id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`name` VARCHAR(100) NOT NULL,
	`eng_name` VARCHAR(100) NOT NULL,
	`description` TEXT(65535) NOT NULL,
	`eng_description` TEXT(65535),
	`price` DECIMAL(10,2) NOT NULL,
	`stock_quantity` INTEGER NOT NULL,
	`2d_img` VARCHAR(255) NOT NULL,
	`3d_model` VARCHAR(255) NOT NULL,
	`genre_id` INTEGER NOT NULL,
	`created_at` TIMESTAMP NOT NULL,
	`updated_at` TIMESTAMP NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE `user` (
	`id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`name` VARCHAR(100) NOT NULL,
	`email` VARCHAR(100) NOT NULL,
	`phone` VARCHAR(20),
	`address` TEXT(65535),
	`role` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
	`password` VARCHAR(500) NOT NULL,
	`created_at` TIMESTAMP NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE `orders` (
	`order_id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`user_id` INTEGER NOT NULL,
	`order_time` TIMESTAMP NOT NULL,
	`status` ENUM('arrived', 'canceled', 'preparing', 'shipped', 'completed') NOT NULL DEFAULT 'preparing',
	`shipping_address` TEXT(65535) NOT NULL,
	`total_price` DECIMAL(10,2) NOT NULL,
	`payment_method` VARCHAR(10) NOT NULL,
	`updated_at` TIMESTAMP,
	PRIMARY KEY(`order_id`)
);


CREATE TABLE `order_details` (
	`order_details_id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`order_id` INTEGER NOT NULL,
	`product_id` INTEGER NOT NULL,
	`quantity` INTEGER NOT NULL,
	`price` DECIMAL(10,2) NOT NULL,
	PRIMARY KEY(`order_details_id`)
);


CREATE TABLE `notifications` (
	`id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`title` VARCHAR(255) NOT NULL,
	`message` TEXT(65535) NOT NULL,
	`created_by` INTEGER NOT NULL,
	`created_at` TIMESTAMP NOT NULL,
	`status` ENUM('draft', 'sent') NOT NULL DEFAULT 'draft',
	`is_deleted` BOOLEAN NOT NULL DEFAULT false,
	PRIMARY KEY(`id`)
);


CREATE TABLE `notification_user ` (
	`id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`notification_id` INTEGER NOT NULL,
	`user_id` INTEGER NOT NULL,
	`is_read` BOOLEAN NOT NULL DEFAULT false,
	`is_deleted` BOOLEAN NOT NULL DEFAULT false,
	`sent_at` TIMESTAMP NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE `genres` (
	`id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`name` VARCHAR(50) NOT NULL UNIQUE,
	PRIMARY KEY(`id`)
);


CREATE TABLE `ingredients` (
	`id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`name` VARCHAR(50) NOT NULL UNIQUE,
	`description` TEXT(65535) NOT NULL,
	`eng_description` TEXT(65535),
	PRIMARY KEY(`id`)
);


CREATE TABLE `products_ingredients` (
	`id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	` product_id` INTEGER NOT NULL,
	`ingredient_id` INTEGER NOT NULL,
	`amount` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`id`)
);


CREATE TABLE `traffic` (
	`id` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`user_id` INTEGER,
	`page` VARCHAR(100),
	`ip_address` VARCHAR(255),
	`device` VARCHAR(10) NOT NULL,
	`time` TIMESTAMP NOT NULL,
	PRIMARY KEY(`id`)
);


ALTER TABLE `orders`
ADD FOREIGN KEY(`user_id`) REFERENCES `user`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `order_details`
ADD FOREIGN KEY(`order_id`) REFERENCES `orders`(`order_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `order_details`
ADD FOREIGN KEY(`product_id`) REFERENCES `products`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `notifications`
ADD FOREIGN KEY(`created_by`) REFERENCES `user`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `notification_user `
ADD FOREIGN KEY(`notification_id`) REFERENCES `notifications`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `notification_user `
ADD FOREIGN KEY(`user_id`) REFERENCES `user`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `products`
ADD FOREIGN KEY(`id`) REFERENCES `products_ingredients`(` product_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `products_ingredients`
ADD FOREIGN KEY(`ingredient_id`) REFERENCES `ingredients`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `products`
ADD FOREIGN KEY(`genre_id`) REFERENCES `genres`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;