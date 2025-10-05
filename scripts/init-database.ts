/**
 * INITIAL SETUP ONLY
 * Only Run Once
 * Run: npm run db:init
 */

import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  user: process.env.DATABASE_USER || 'fuwari_user',
  password: process.env.DATABASE_PASSWORD || 'fuwari_password',
  database: process.env.DATABASE_NAME || 'fuwari_db',
  multipleStatements: true,
};

async function initDatabase() {
  console.log('🚀 Initial Database Setup...\n');
  console.log('⚠️  WARNING: This will DROP all existing tables!\n');
  
  let connection: mysql.Connection | null = null;
  
  try {
    connection = await mysql.createConnection({
      ...dbConfig,
      multipleStatements: true,
    });
    console.log('✅ Connected!\n');
    
    const initSqlPath = path.join(process.cwd(), 'init.sql');
    const sql = fs.readFileSync(initSqlPath, 'utf8');
    
    // Execute all SQL at once to maintain session variables like FOREIGN_KEY_CHECKS
    try {
      await connection.query(sql);
      console.log('✅ Executed init.sql successfully');
      console.log('✅ Created tables: users, products, orders');
      console.log('✅ Inserted sample data');
    } catch (error: any) {
      console.error(`❌ Error executing init.sql:`, error.message);
      throw error;
    }
    
    console.log('\n🎉 Initial setup completed!');
    console.log('\n📝 Sample accounts:');
    console.log('   Admin: admin@fuwari.com / admin123');
    console.log('   User:  user@example.com / user123\n');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

initDatabase();
