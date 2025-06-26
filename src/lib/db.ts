import { Pool, PoolConfig } from "pg";

// Type definition for the global variable to avoid TypeScript errors.
declare const global: typeof globalThis & {
  dbPool: Pool;
};

let pool: Pool;

// Centralized configuration for the database pool.
const config: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.POSTGRES_SSL_ENABLED === "true"
      ? { rejectUnauthorized: false } // Required for platforms like Railway
      : undefined,
};

if (process.env.NODE_ENV === "production") {
  // In production, create a new pool.
  pool = new Pool(config);
} else {
  // In development, use a global variable to preserve the pool across hot reloads.
  if (!global.dbPool) {
    global.dbPool = new Pool(config);
  }
  pool = global.dbPool;
}

export const db = pool;

export async function isDatabaseInitialized() {
  const client = await db.connect();
  try {
    const requiredTables = ["users", "posts", "settings"];
    for (const table of requiredTables) {
      const res = await client.query(
        `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `,
        [table],
      );
      if (!res.rows[0].exists) {
        return false;
      }
    }
    return true;
  } finally {
    client.release();
  }
}
