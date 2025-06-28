import { withDbConnection } from "@/lib/db";
import bcrypt from "bcryptjs";

import { dbSchema } from "./schema";

export async function initializeDatabase() {
  return withDbConnection(async (client) => {
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

      console.log(`checking for missing columns in ${tableName}...`);
      const tableInfoQuery = `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = '${tableName}';
      `;

      const existingColumns = await client.query(tableInfoQuery);
      const existingColumnNames = existingColumns.rows.map(
        (row) => row.column_name,
      );

      for (const [colName, colDef] of Object.entries(columns)) {
        if (!existingColumnNames.includes(colName)) {
          console.log(`adding missing column: ${colName} to ${tableName}`);
          const addColumnQuery = `
            ALTER TABLE ${tableName}
            ADD COLUMN "${colName}" ${colDef};
          `;
          await client.query(addColumnQuery);
        }
      }
    }
  }, "initializeDatabase");
}

export async function seedDatabase() {
  return withDbConnection(async (client) => {
    const adminUsername = "admin";
    const adminPassword = "password";

    // Seed admin user
    const existingUser = await client.query("SELECT * FROM users");

    if (existingUser.rows.length === 0) {
      console.log("no existing users found, seeding admin user...");
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await client.query(
        "INSERT INTO users (username, password, recovery_passphrase) VALUES ($1, $2, NULL)",
        [adminUsername, hashedPassword],
      );
      console.log("admin user seeded.");
    } else {
      const blankPasswordUsers = await client.query(
        "SELECT id, username FROM users WHERE password = 'reset' OR password IS NULL",
      );

      if (blankPasswordUsers.rows.length > 0) {
        console.log(
          `Found ${blankPasswordUsers.rows.length} user(s) with blank passwords. Setting default passwords...`,
        );

        for (const user of blankPasswordUsers.rows) {
          const defaultPassword = "password";
          const hashedPassword = await bcrypt.hash(defaultPassword, 12);

          await client.query("UPDATE users SET password = $1 WHERE id = $2", [
            hashedPassword,
            user.id,
          ]);

          console.log(`Default password set for user: ${user.username}`);
        }
      }
    }

    // Seed settings
    const existingSettings = await client.query("SELECT * FROM settings");
    if (existingSettings.rows.length === 0) {
      console.log("no settings row found, seeding settings...");
      await client.query("INSERT INTO settings (id) VALUES (1)");
      console.log("settings seeded.");
    }
  }, "seedDatabase");
}
