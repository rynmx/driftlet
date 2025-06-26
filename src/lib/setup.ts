import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function initializeDatabase() {
  const client = await db.connect();
  try {
    // Enable UUID generation
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        content TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        author_id UUID NOT NULL REFERENCES users(id)
      );
    `);

    // Add columns to users table for portfolio info
    const alterUserStatements = [
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS extended_bio TEXT;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS links JSONB;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS header_text TEXT DEFAULT 'driftlet';`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS header_icon_url TEXT;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS show_header_icon BOOLEAN DEFAULT true;`,
    ];

    for (const statement of alterUserStatements) {
      await client.query(statement);
    }

    // Create settings table (singleton)
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY DEFAULT 1,
        favicon_url TEXT,
        show_attribution BOOLEAN DEFAULT true,
        CONSTRAINT single_row CHECK (id = 1)
      );
    `);
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
      console.log("no existing users found, seeding database...");
      // Seed admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await client.query(
        "INSERT INTO users (username, password) VALUES ($1, $2)",
        [adminUsername, hashedPassword],
      );

      // Seed settings
      await client.query("INSERT INTO settings (id) VALUES (1)");
      console.log("database seeded.");
    }
  } finally {
    client.release();
  }
}
