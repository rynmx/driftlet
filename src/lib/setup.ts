import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

import { dbSchema } from "./schema";

export async function initializeDatabase() {
  const client = await db.connect();
  try {
    // Enable UUID generation
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Create tables dynamically from schema
    for (const tableName of Object.keys(dbSchema)) {
      const table = dbSchema[tableName as keyof typeof dbSchema];
      const columns = table.columns;

      const columnDefinitions = Object.entries(columns)
        .map(([colName, colDef]) => `"${colName}" ${colDef}`)
        .join(",\n");

      const constraints = "constraints" in table ? table.constraints : "";

      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          ${columnDefinitions}${constraints ? `,\n${constraints}` : ""}
        );
      `;

      await client.query(createTableQuery);
    }
  } finally {
    client.release();
  }
}

export async function seedDatabase() {
  const client = await db.connect();
  try {
    const adminUsername = "admin";
    const adminPassword = "password";

    // Seed admin user
    const existingUser = await client.query("SELECT * FROM users");

    if (existingUser.rows.length === 0) {
      console.log("no existing users found, seeding admin user...");
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await client.query(
        "INSERT INTO users (username, password) VALUES ($1, $2)",
        [adminUsername, hashedPassword],
      );
      console.log("admin user seeded.");
    }

    // Seed settings
    const existingSettings = await client.query("SELECT * FROM settings");
    if (existingSettings.rows.length === 0) {
      console.log("no settings row found, seeding settings...");
      await client.query("INSERT INTO settings (id) VALUES (1)");
      console.log("settings seeded.");
    }
  } finally {
    client.release();
  }
}
