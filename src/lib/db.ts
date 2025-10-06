/**
 * Database Connection Module
 * Handles MySQL connection pool and query execution
 */

import mysql from 'mysql2/promise';

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'fuwari_db',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Create connection pool
let pool: mysql.Pool;

/**
 * Get database connection pool
 * Creates pool if it doesn't exist
 */
export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log('✅ MySQL connection pool created');
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
    const [results] = await connection.execute(sqlQuery, params);
    return results as T;
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
export async function beginTransaction(): Promise<mysql.PoolConnection> {
  const connection = await getPool().getConnection();
  await connection.beginTransaction();
  return connection;
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const connection = getPool();
    await connection.execute('SELECT 1');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

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
 * Convert ISO datetime string to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
 * @param isoString ISO datetime string (e.g., '2025-10-05T03:56:10.069Z')
 * @returns MySQL datetime string (e.g., '2025-10-05 03:56:10')
 */
export function toMySQLDateTime(isoString: string | Date): string {
  const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

// Helper type for MySQL row data packet
export type RowDataPacket = mysql.RowDataPacket;
export type ResultSetHeader = mysql.ResultSetHeader;

// Default export
const db = {
  query,
  queryOne,
  getPool,
  beginTransaction,
  testConnection,
  closePool,
  toMySQLDateTime,
};

export default db;
