import { config } from "dotenv";
import { seedDatabase } from "@/lib/setup";
import { db } from "@/lib/db";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function main() {
  console.log("starting database seeding...");
  try {
    await seedDatabase();
    console.log("database seeding complete.");
  } catch (error) {
    console.error("error seeding database:", error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

main();
