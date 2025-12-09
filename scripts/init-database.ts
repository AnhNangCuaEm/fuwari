/**
 * INITIAL SETUP ONLY
 * Only Run Once
 * Run: npm run db:init
 */

import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

const dbConfig = {
  host: 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  user: process.env.DATABASE_USER || 'fuwari_user',
  password: process.env.DATABASE_PASSWORD || 'fuwari_password',
  database: process.env.DATABASE_NAME || 'fuwari_db',
};

async function initDatabase() {
  console.log('🚀 Initial Database Setup...\n');
  console.log('⚠️  WARNING: This will DROP all existing tables!\n');
  
  let client: Client | null = null;
  
  try {
    client = new Client(dbConfig);
    await client.connect();
    console.log('✅ Connected!\n');
    
    const initSqlPath = path.join(process.cwd(), 'init.sql');
    let sql = fs.readFileSync(initSqlPath, 'utf-8'); 
    //Remove Bom if exists
    if (sql.charCodeAt(0) === 0xFEFF) {
      sql = sql.slice(1);
    }   
    // Execute all SQL at once
    try {
      await client.query(sql);
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
    if (client) await client.end();
  }
}

initDatabase();
