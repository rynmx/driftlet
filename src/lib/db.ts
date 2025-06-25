import { Pool } from "pg";

let pool: Pool;

if (process.env.NODE_ENV === "production") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // In development, we can use a global variable to avoid creating a new pool on every hot reload.
  if (!global.dbPool) {
    global.dbPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  pool = global.dbPool;
}

export const db = pool;
