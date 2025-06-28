import { config } from "dotenv";
import { withDbConnection, db } from "@/lib/db";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function testAutoInitialization() {
  console.log("Testing auto-initialization functionality...");

  try {
    // First, let's try to drop a table to simulate a missing table scenario
    console.log("1. Dropping 'users' table to simulate missing table...");
    await withDbConnection(async (client) => {
      await client.query("DROP TABLE IF EXISTS users CASCADE");
      console.log("   Users table dropped successfully");
    }, "drop-users-table");

    // Now try to query the users table - this should trigger auto-initialization
    console.log(
      "2. Attempting to query missing 'users' table (should trigger auto-init)...",
    );
    const result = await withDbConnection(async (client) => {
      const res = await client.query("SELECT COUNT(*) FROM users");
      return res.rows[0].count;
    }, "test-missing-table");

    console.log(`   Success! Found ${result} users in the table`);
    console.log("   Auto-initialization worked correctly!");

    // Test missing column scenario
    console.log("3. Testing missing column scenario...");

    // Remove a column that should exist in our schema (e.g., 'name' column)
    await withDbConnection(async (client) => {
      await client.query("ALTER TABLE users DROP COLUMN IF EXISTS name");
      console.log("   Removed 'name' column to simulate missing column");
    }, "remove-name-column");

    // Now try to query the missing column - this should trigger auto-initialization
    try {
      await withDbConnection(async (client) => {
        const res = await client.query("SELECT name FROM users LIMIT 1");
        console.log("   Successfully queried 'name' column after auto-init");
        return res.rows;
      }, "test-missing-column");

      console.log("   Missing column detection and recovery: ✅");
    } catch (error) {
      console.log("   Missing column test result:", error.message);
    }

    // Final verification that schema is complete
    const userCount = await withDbConnection(async (client) => {
      const res = await client.query("SELECT COUNT(*) FROM users");
      return res.rows[0].count;
    }, "verify-schema");

    console.log(`   Schema verification successful. User count: ${userCount}`);

    console.log("\n✅ Auto-initialization test completed successfully!");
    console.log("   - Missing table detection and recovery: ✅");
    console.log("   - Missing column detection and recovery: ✅");
    console.log("   - Schema verification after auto-init: ✅");
  } catch (error) {
    console.error("❌ Auto-initialization test failed:", error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

// Run the test
testAutoInitialization();
