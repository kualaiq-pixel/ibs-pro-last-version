import { Pool, type PoolConfig, type QueryResult, type QueryResultRow } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || '';

const poolConfig: PoolConfig = {
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('supabase') ? { rejectUnauthorized: false } : undefined,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

// Disable prepared statements for pgbouncer compatibility
const pool = new Pool({
  ...poolConfig,
  allowExitOnIdle: true,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

// Helper to run a query and return rows
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (duration > 500) {
    console.warn(`Slow query (${duration}ms): ${text.substring(0, 100)}...`);
  }
  return result;
}

// Helper to get a single row
export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const result = await query<T>(text, params);
  return result.rows[0] || null;
}

// Helper to get all rows
export async function queryAll<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await query<T>(text, params);
  return result.rows;
}

// Generate a CUID-like ID (simple version for inserts)
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  const counter = (process.pid || 0).toString(36);
  return `c${timestamp}${random}${counter}`;
}

export default pool;
