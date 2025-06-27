import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassphrase } from "@/lib/passphrase";
import bcrypt from "bcryptjs";

// Verify passphrase and set a new password
export async function PATCH(req: Request) {
  try {
    const { username, passphrase, newPassword } = await req.json();

    if (!username || !passphrase || !newPassword) {
      return NextResponse.json(
        { error: "username, passphrase, and newPassword are required" },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    const client = await db.connect();
    try {
      // Find the user
      const userResult = await client.query(
        "SELECT id, username, recovery_passphrase, recovery_passphrase_created_at FROM users WHERE username = $1",
        [username],
      );

      if (userResult.rows.length === 0) {
        return NextResponse.json({ error: "user not found" }, { status: 404 });
      }

      const user = userResult.rows[0];

      // Check if passphrase exists
      if (!user.recovery_passphrase) {
        return NextResponse.json(
          { error: "no recovery passphrase found for this user" },
          { status: 404 },
        );
      }

      // Verify passphrase
      const isValidPassphrase = await verifyPassphrase(
        passphrase,
        user.recovery_passphrase,
      );

      if (!isValidPassphrase) {
        return NextResponse.json(
          { error: "invalid recovery passphrase" },
          { status: 401 },
        );
      }

      // Generate new hashed password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update user's password and clear the recovery passphrase
      await client.query(
        "UPDATE users SET password = $1, recovery_passphrase = NULL, recovery_passphrase_created_at = NULL WHERE id = $2",
        [hashedPassword, user.id],
      );

      return NextResponse.json({
        success: true,
        message: "Password has been reset successfully",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Failed to reset password:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
