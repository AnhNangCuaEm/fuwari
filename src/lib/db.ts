/**
 * Database Connection Module
 * Handles PostgreSQL connection pool and query execution
 */

import { Pool, PoolClient } from 'pg';

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'fuwari_db',
  max: 10, // Max connections in pool
  idleTimeoutMillis: 60000, // Close idle connections after 60s
  connectionTimeoutMillis: 10000, // 10s connection timeout
};

// Create connection pool
let pool: Pool;

/**
 * Get database connection pool
 * Creates pool if it doesn't exist
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(dbConfig);
    console.log('✅ PostgreSQL connection pool created');
  }
  return pool;
}

/**
 * Execute a query with parameters
 * @param query SQL query string
 * @param params Query parameters
 * @returns Query results
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query<T = any>(
  sqlQuery: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any[]
): Promise<T> {
  try {
    const connection = getPool();
    const result = await connection.query(sqlQuery, params);
    return result.rows as T;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
}

/**
 * Execute a query and return the first row
 * @param query SQL query string
 * @param params Query parameters
 * @returns First row or null
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function queryOne<T = any>(
  sqlQuery: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any[]
): Promise<T | null> {
  try {
    const results = await query<T[]>(sqlQuery, params);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('❌ Database queryOne error:', error);
    throw error;
  }
}

/**
 * Begin a transaction
 * @returns Connection with transaction
 */
export async function beginTransaction(): Promise<PoolClient> {
  const client = await getPool().connect();
  await client.query('BEGIN');
  return client;
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const connection = getPool();
    await connection.query('SELECT 1');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// ...existing code...

/**
 * Close all connections in the pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    console.log('✅ Database connection pool closed');
  }
}

// Export pool for direct access if needed
export { pool };

/**
 * Convert ISO datetime string to PostgreSQL datetime format (YYYY-MM-DD HH:MM:SS)
 * @param isoString ISO datetime string (e.g., '2025-10-05T03:56:10.069Z')
 * @returns PostgreSQL datetime string (e.g., '2025-10-05 03:56:10')
 */
export function toPostgresDateTime(isoString: string | Date): string {
  const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

// Helper type for PostgreSQL row data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RowDataPacket = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResultSetHeader = { rowCount: number; rows: any[] };

// Default export
const db = {
  query,
  queryOne,
  getPool,
  beginTransaction,
  testConnection,
  closePool,
  toPostgresDateTime,
};

export default db;
