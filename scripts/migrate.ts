/**
 * MIGRATION SYSTEM
 * Run changes to the database incrementally.
 * Run: npm run migrate
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

async function runMigrations() {
  console.log('🔄 Running migrations...\n');
  
  let client: Client | null = null;
  
  try {
    client = new Client(dbConfig);
    await client.connect();
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
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
      const result = await client.query(
        'SELECT * FROM migrations WHERE name = $1',
        [file]
      );
      
      if (result.rows.length > 0) {
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
        await client.query(statement);
      }
      
      await client.query(
        'INSERT INTO migrations (name) VALUES ($1)',
        [file]
      );
      
      console.log(`✅ Completed: ${file}`);
    }
    
    console.log('\n🎉 All migrations completed!\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (client) await client.end();
  }
}

runMigrations();