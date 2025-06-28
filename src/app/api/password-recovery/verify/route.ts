import { NextResponse } from "next/server";
import { withDbConnection } from "@/lib/db";
import { verifyPassphrase } from "@/lib/passphrase";

// Verify recovery credentials without resetting the password
export async function POST(req: Request) {
  try {
    const { username, passphrase } = await req.json();

    if (!username || !passphrase) {
      return NextResponse.json(
        { error: "username and passphrase are required" },
        { status: 400 },
      );
    }

    return await withDbConnection(async (client) => {
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

      return NextResponse.json({
        success: true,
        message: "Credentials verified successfully",
      });
    });
  } catch (error) {
    console.error("Failed to verify recovery credentials:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
