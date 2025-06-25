import { Pool, PoolConfig } from "pg";

// Type definition for the global variable to avoid TypeScript errors.
declare const global: typeof globalThis & {
  dbPool: Pool;
};

let pool: Pool;

// Centralized configuration for the database pool.
const config: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  // Conditionally add SSL configuration for production environments,
  // but only if the database is not on localhost.
  ...(process.env.NODE_ENV === "production" &&
    !process.env.DATABASE_URL?.includes("localhost") && {
      ssl: {
        rejectUnauthorized: false,
      },
    }),
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
