import { config } from "dotenv";
import { Pool } from "pg";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is not set in .env.local");
    process.exit(1);
  }

  const url = new URL(dbUrl);
  const dbName = url.pathname.substring(1);

  // Connect to the default 'postgres' database to manage our target database
  const pool = new Pool({
    user: url.username,
    password: url.password,
    host: url.hostname,
    port: Number(url.port),
    database: "postgres", // System database
  });

  const client = await pool.connect();
  console.log(`connected to 'postgres' database to manage '${dbName}'...`);

  try {
    // Terminate all connections to the target database
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${dbName}'
        AND pid <> pg_backend_pid();
    `);
    console.log(`all connections to '${dbName}' have been terminated.`);

    // Drop the database
    await client.query(`DROP DATABASE IF EXISTS "${dbName}";`);
    console.log(`database '${dbName}' dropped.`);

    // Recreate the database
    await client.query(`CREATE DATABASE "${dbName}";`);
    console.log(`database '${dbName}' created.`);
  } catch (error) {
    console.error("error nuking database:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
    console.log("database nuke complete.");
  }
}

main();
