import { config } from "dotenv";
import { withDbConnection, db } from "@/lib/db";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function testApiAutoInitialization() {
  console.log("Testing auto-initialization in API context...");

  try {
    // Drop the posts table to simulate missing table
    console.log("1. Dropping 'posts' table to simulate missing table...");
    await withDbConnection(async (client) => {
      await client.query("DROP TABLE IF EXISTS posts CASCADE");
      console.log("   Posts table dropped successfully");
    }, "drop-posts-table");

    // Now try to use the getPosts function which should trigger auto-initialization
    console.log(
      "2. Attempting to use getPosts function (should trigger auto-init)...",
    );

    // Import and use the getPosts function
    const { getPosts } = await import("@/lib/posts");

    const posts = await getPosts();
    console.log(`   Success! Retrieved ${posts.length} posts`);
    console.log("   Auto-initialization worked correctly in API context!");

    console.log("\n✅ API auto-initialization test completed successfully!");
  } catch (error) {
    console.error("❌ API auto-initialization test failed:", error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

// Run the test
testApiAutoInitialization();
