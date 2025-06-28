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
  max: parseInt(process.env.DB_POOL_MAX_CONNECTIONS || "20", 10),
  min: parseInt(process.env.DB_POOL_MIN_CONNECTIONS || "2", 10),
  connectionTimeoutMillis: parseInt(
    process.env.DB_CONNECTION_TIMEOUT_MS || "5000",
    10,
  ),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || "30000", 10),
  query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT_MS || "30000", 10),
  statement_timeout: parseInt(
    process.env.DB_STATEMENT_TIMEOUT_MS || "60000",
    10,
  ),
  allowExitOnIdle: true,
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

import { dbSchema } from "./schema";

export async function isDatabaseInitialized() {
  const client = await db.connect();
  try {
    for (const tableName in dbSchema) {
      const table = dbSchema[tableName as keyof typeof dbSchema];
      const requiredColumns = Object.keys(table.columns);

      const res = await client.query(
        `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1;
      `,
        [tableName],
      );

      if (res.rowCount === 0) {
        console.log(
          `database initialization check failed: table "${tableName}" not found.`,
        );
        return false;
      }

      const existingColumns = new Set(res.rows.map((row) => row.column_name));
      for (const col of requiredColumns) {
        if (!existingColumns.has(col)) {
          console.log(
            `database initialization check failed: column "${col}" not found in table "${tableName}".`,
          );
          return false;
        }
      }
    }

    return true;
  } finally {
    client.release();
  }
}
