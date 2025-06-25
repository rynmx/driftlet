import { config } from "dotenv";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function main() {
  console.log("starting database seeding...");
  const client = await db.connect();

  try {
    const adminUsername = "admin";
    const adminPassword = "password"; // This should be a strong password, perhaps from env vars

    // Check if the admin user already exists
    const existingUser = await client.query(
      "SELECT * FROM users WHERE username = $1",
      [adminUsername],
    );

    if (existingUser.rows.length > 0) {
      console.log("admin user already exists.");
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Insert the new admin user
    await client.query(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      [adminUsername, hashedPassword],
    );

    console.log("admin user created successfully.");
  } catch (error) {
    console.error("error seeding database:", error);
    process.exit(1);
  } finally {
    client.release();
    await db.end();
    console.log("database seeding complete.");
  }
}

main();
