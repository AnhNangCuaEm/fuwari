/**
 * MIGRATION SYSTEM
 * Run changes to the database incrementally.
 * Run: npm run migrate
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
  charset: 'utf8mb4',
};

async function runMigrations() {
  console.log('🔄 Running migrations...\n');
  
  let connection: mysql.Connection | null = null;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Set connection charset to UTF-8
    await connection.query("SET NAMES 'utf8mb4'");
    await connection.query("SET CHARACTER SET utf8mb4");
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const migrationsDir = path.join(process.cwd(), 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir);
      console.log('📁 Created migrations folder\n');
      console.log('ℹ️  No migrations to run.\n');
      return;
    }
    
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    if (files.length === 0) {
      console.log('ℹ️  No migrations to run.\n');
      return;
    }
    
    for (const file of files) {
      // Check đã chạy chưa
      const [rows] = await connection.execute(
        'SELECT * FROM migrations WHERE name = ?',
        [file]
      );
      
      if ((rows as any[]).length > 0) {
        console.log(`⏭️  Skipped: ${file} (already executed)`);
        continue;
      }
      
      console.log(`🔄 Running: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      for (const statement of statements) {
        if (!statement.trim()) continue;
        await connection.execute(statement);
      }
      
      await connection.execute(
        'INSERT INTO migrations (name) VALUES (?)',
        [file]
      );
      
      console.log(`✅ Completed: ${file}`);
    }
    
    console.log('\n🎉 All migrations completed!\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

runMigrations();