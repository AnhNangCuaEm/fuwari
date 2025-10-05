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
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected!\n');
    
    const initSqlPath = path.join(process.cwd(), 'init.sql');
    const sql = fs.readFileSync(initSqlPath, 'utf8');
    
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (!statement.trim()) continue;
      
      try {
        await connection.execute(statement);
        
        if (statement.includes('CREATE TABLE')) {
          const match = statement.match(/CREATE TABLE `?(\w+)`?/i);
          if (match) console.log(`✅ Created table: ${match[1]}`);
        } else if (statement.includes('INSERT INTO')) {
          const match = statement.match(/INSERT INTO `?(\w+)`?/i);
          if (match) console.log(`✅ Inserted sample data into: ${match[1]}`);
        }
      } catch (error: any) {
        if (error.code !== 'ER_TABLE_EXISTS_ERROR') {
          console.error(`❌ Error:`, error.message);
        }
      }
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
