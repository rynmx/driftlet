import { config } from "dotenv";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function main() {
  console.log("Resetting user password...");
  const client = await db.connect();

  try {
    // Generate a hash for the password "password"
    const newPassword = "password";
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update all users with the new password
    const updateResult = await client.query(
      "UPDATE users SET password = $1 RETURNING id, username",
      [hashedPassword],
    );

    if (updateResult.rowCount === 0) {
      console.log("No users found to update.");
    } else {
      console.log(`Password reset for ${updateResult.rowCount} user(s):`);
      updateResult.rows.forEach((user) => {
        console.log(`- ${user.username} (${user.id})`);
      });
      console.log(`\nNew password set to: "${hashedPassword}"`);
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    process.exit(1);
  } finally {
    client.release();
    await db.end();
    console.log("Password reset operation complete.");
  }
}

main();
