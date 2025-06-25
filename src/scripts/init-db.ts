import { config } from "dotenv";
import { initializeDatabase } from "@/lib/setup";
import { db } from "@/lib/db";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function main() {
  console.log("starting database initialization...");
  try {
    await initializeDatabase();
    console.log("database initialization complete.");
  } catch (error) {
    console.error("error initializing database:", error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

main();
