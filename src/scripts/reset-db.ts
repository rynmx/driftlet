import { config } from "dotenv";
import { db } from "@/lib/db";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function main() {
  console.log("starting database reset...");
  const client = await db.connect();

  try {
    // Drop tables if they exist
    await client.query("DROP TABLE IF EXISTS posts CASCADE;");
    console.log('"posts" table dropped.');

    await client.query("DROP TABLE IF EXISTS users CASCADE;");
    console.log('"users" table dropped.');

    // Re-initialize the database
    console.log("re-initializing database...");

    // Enable UUID generation
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log("uuid-ossp extension enabled.");

    // Create users table
    await client.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('"users" table created successfully.');

    // Create posts table
    await client.query(`
      CREATE TABLE posts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        content TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        author_id UUID NOT NULL REFERENCES users(id)
      );
    `);
    console.log('"posts" table created successfully.');

    // Add columns to users table for portfolio info
    const alterStatements = [
      `ALTER TABLE users ADD COLUMN name TEXT;`,
      `ALTER TABLE users ADD COLUMN bio TEXT;`,
      `ALTER TABLE users ADD COLUMN extended_bio TEXT;`,
      `ALTER TABLE users ADD COLUMN profile_picture_url TEXT;`,
      `ALTER TABLE users ADD COLUMN header_text TEXT DEFAULT 'driftlet';`,
      `ALTER TABLE users ADD COLUMN header_icon_link TEXT;`,
      `ALTER TABLE users ADD COLUMN links JSONB;`,
      `ALTER TABLE users ADD COLUMN show_attribution BOOLEAN DEFAULT true;`,
    ];

    for (const statement of alterStatements) {
      await client.query(statement);
    }
    console.log('"users" table altered successfully.');
  } catch (error) {
    console.error("error resetting database:", error);
    process.exit(1);
  } finally {
    client.release();
    await db.end();
    console.log("database reset complete.");
  }
}

main();
