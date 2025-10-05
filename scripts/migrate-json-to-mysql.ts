/**
 * Migration Script: JSON to MySQL
 * This script migrates data from JSON files to MySQL database
 * Run: npx ts-node scripts/migrate-json-to-mysql.ts
 */

import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

/**
 * Convert ISO 8601 datetime to MySQL format
 * @param isoString ISO datetime string (e.g., "2025-08-20T14:28:35.449Z" or "2024-10-01T10:00:00Z")
 * @returns MySQL datetime string (e.g., "2025-08-20 14:28:35")
 */
function toMySQLDateTime(isoString: string): string {
  // Remove milliseconds and Z, replace T with space
  return isoString.replace('T', ' ').replace(/\.\d+Z$/, '').replace('Z', '');
}

// Database configuration
// When running from host machine, use 'localhost' instead of 'mysql'
const dbConfig = {
  host: 'localhost', // Use localhost when running migration from host
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  user: process.env.DATABASE_USER || 'fuwari_user',
  password: process.env.DATABASE_PASSWORD || 'fuwari_password',
  database: process.env.DATABASE_NAME || 'fuwari_db',
};

interface JsonUser {
  id: string;
  email: string;
  name: string;
  password?: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
  role: string;
  status: string;
  phone?: string;
  address?: string;
  image?: string;
  postalCode?: string;
  city?: string;
}

interface JsonProduct {
  id: number;
  name: string;
  engName: string;
  description: string;
  engDescription: string;
  ingredients: string[];
  engIngredients: string[];
  allergens: string[];
  engAllergens: string[];
  price: number;
  quantity: number;
  image: string;
  modelPath: string;
  created_at: string;
  updated_at: string;
}

interface JsonOrder {
  id: string;
  customerId: string;
  customerEmail: string;
  items: any[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: string;
  stripePaymentIntentId?: string;
  shippingAddress: any;
  createdAt: string;
  updatedAt: string;
}

async function migrateUsers(connection: mysql.Connection) {
  console.log('\n📦 Migrating Users...');
  
  const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
  
  if (!fs.existsSync(usersFilePath)) {
    console.log('⚠️  users.json not found, skipping...');
    return;
  }

  const users: JsonUser[] = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
  
  for (const user of users) {
    try {
      await connection.execute(
        `INSERT INTO users (id, email, name, password, provider, role, status, phone, address, image, postalCode, city, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         name = VALUES(name), 
         phone = VALUES(phone), 
         address = VALUES(address), 
         image = VALUES(image),
         postalCode = VALUES(postalCode),
         city = VALUES(city),
         updatedAt = VALUES(updatedAt)`,
        [
          user.id,
          user.email,
          user.name,
          user.password || null,
          user.provider,
          user.role,
          user.status,
          user.phone || null,
          user.address || null,
          user.image || null,
          user.postalCode || null,
          user.city || null,
          toMySQLDateTime(user.createdAt),
          toMySQLDateTime(user.updatedAt),
        ]
      );
      console.log(`✅ Migrated user: ${user.email}`);
    } catch (error) {
      console.error(`❌ Error migrating user ${user.email}:`, error);
    }
  }
  
  console.log(`✨ Users migration completed! Total: ${users.length}`);
}

async function migrateProducts(connection: mysql.Connection) {
  console.log('\n📦 Migrating Products...');
  
  const productsFilePath = path.join(process.cwd(), 'data', 'products.json');
  
  if (!fs.existsSync(productsFilePath)) {
    console.log('⚠️  products.json not found, skipping...');
    return;
  }

  const products: JsonProduct[] = JSON.parse(fs.readFileSync(productsFilePath, 'utf8'));
  
  for (const product of products) {
    try {
      await connection.execute(
        `INSERT INTO products (id, name, engName, description, engDescription, ingredients, engIngredients, allergens, engAllergens, price, quantity, image, modelPath, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         name = VALUES(name), 
         engName = VALUES(engName),
         description = VALUES(description),
         engDescription = VALUES(engDescription),
         ingredients = VALUES(ingredients),
         engIngredients = VALUES(engIngredients),
         allergens = VALUES(allergens),
         engAllergens = VALUES(engAllergens),
         price = VALUES(price),
         quantity = VALUES(quantity),
         image = VALUES(image),
         modelPath = VALUES(modelPath),
         updated_at = VALUES(updated_at)`,
        [
          product.id,
          product.name,
          product.engName,
          product.description,
          product.engDescription,
          JSON.stringify(product.ingredients),
          JSON.stringify(product.engIngredients),
          JSON.stringify(product.allergens),
          JSON.stringify(product.engAllergens),
          product.price,
          product.quantity,
          product.image,
          product.modelPath,
          toMySQLDateTime(product.created_at),
          toMySQLDateTime(product.updated_at),
        ]
      );
      console.log(`✅ Migrated product: ${product.name} (${product.engName})`);
    } catch (error) {
      console.error(`❌ Error migrating product ${product.id}:`, error);
    }
  }
  
  console.log(`✨ Products migration completed! Total: ${products.length}`);
}

async function migrateOrders(connection: mysql.Connection) {
  console.log('\n📦 Migrating Orders...');
  
  const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');
  
  if (!fs.existsSync(ordersFilePath)) {
    console.log('⚠️  orders.json not found, skipping...');
    return;
  }

  const orders: JsonOrder[] = JSON.parse(fs.readFileSync(ordersFilePath, 'utf8'));
  
  for (const order of orders) {
    try {
      // Find user ID from email (since customerId in JSON is actually email)
      const [userRows] = await connection.execute<mysql.RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ? LIMIT 1',
        [order.customerEmail]
      );
      
      let actualCustomerId = order.customerId;
      if (userRows && userRows.length > 0) {
        actualCustomerId = userRows[0].id;
      } else {
        console.log(`⚠️  User not found for email ${order.customerEmail}, skipping order ${order.id}`);
        continue;
      }

      await connection.execute(
        `INSERT INTO orders (id, customerId, customerEmail, items, subtotal, tax, shipping, total, status, stripePaymentIntentId, shippingAddress, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         status = VALUES(status),
         updatedAt = VALUES(updatedAt)`,
        [
          order.id,
          actualCustomerId,
          order.customerEmail,
          JSON.stringify(order.items),
          order.subtotal,
          order.tax,
          order.shipping,
          order.total,
          order.status,
          order.stripePaymentIntentId || null,
          JSON.stringify(order.shippingAddress),
          toMySQLDateTime(order.createdAt),
          toMySQLDateTime(order.updatedAt),
        ]
      );
      console.log(`✅ Migrated order: ${order.id}`);
    } catch (error) {
      console.error(`❌ Error migrating order ${order.id}:`, error);
    }
  }
  
  console.log(`✨ Orders migration completed! Total: ${orders.length}`);
}

async function main() {
  console.log('🚀 Starting migration from JSON to MySQL...\n');
  
  let connection: mysql.Connection | null = null;
  
  try {
    // Connect to database
    console.log('🔌 Connecting to MySQL database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL!\n');
    
    // Run migrations
    await migrateUsers(connection);
    await migrateProducts(connection);
    await migrateOrders(connection);
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Verify data in MySQL database');
    console.log('2. Backup data/users.json, data/products.json, data/orders.json');
    console.log('3. Test your application with MySQL');
    console.log('4. Once confirmed, you can delete the data/*.json files\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('👋 Database connection closed');
    }
  }
}

// Run migration
main();
