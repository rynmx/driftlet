import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// GET user settings
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const client = await db.connect();
    try {
      const result = await client.query(
        "SELECT username, name, bio, extended_bio, profile_picture_url, header_text, header_icon_link, links, show_attribution FROM users WHERE id = $1",
        [userId],
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "user not found" }, { status: 404 });
      }

      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("failed to fetch settings:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}

// PUT (update) user settings
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      bio,
      extended_bio,
      profile_picture_url,
      header_text,
      header_icon_link,
      links,
      show_attribution,
      username,
      currentPassword,
      newPassword,
    } = body;

    const userId = session.user.id;

    const client = await db.connect();
    try {
      // fetch current user data for validation
      const currentUser = await client.query(
        "SELECT * FROM users WHERE id = $1",
        [userId],
      );
      if (currentUser.rows.length === 0) {
        return NextResponse.json({ error: "user not found" }, { status: 404 });
      }

      const user = currentUser.rows[0];
      let hashedPassword = user.password;

      // handle password change
      if (newPassword) {
        if (!currentPassword) {
          return NextResponse.json(
            { error: "current password is required to set a new password" },
            { status: 400 },
          );
        }
        const isPasswordValid = await bcrypt.compare(
          currentPassword,
          user.password,
        );
        if (!isPasswordValid) {
          return NextResponse.json(
            { error: "invalid current password" },
            { status: 401 },
          );
        }
        hashedPassword = await bcrypt.hash(newPassword, 10);
      }

      // handle username change
      if (username && username !== user.username) {
        const existingUser = await client.query(
          "SELECT id FROM users WHERE username = $1 AND id != $2",
          [username, userId],
        );
        if (existingUser.rows.length > 0) {
          return NextResponse.json(
            { error: "username is already taken" },
            { status: 409 },
          );
        }
      }

      // dynamically build the update query
      const updates: { [key: string]: string | boolean | null } = {
        name,
        bio,
        extended_bio,
        profile_picture_url,
        header_text,
        header_icon_link,
        links: JSON.stringify(links),
        show_attribution,
        username,
        password: hashedPassword,
      };

      const setClauses = Object.keys(updates)
        .map((key, index) => `"${key}" = $${index + 1}`)
        .join(", ");

      const values = Object.values(updates);

      const query = `UPDATE users SET ${setClauses} WHERE id = $${values.length + 1} RETURNING *`;
      values.push(userId);

      const result = await client.query(query, values);

      // remove password from the returned object
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...updatedUser } = result.rows[0];

      return NextResponse.json(updatedUser);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("failed to update settings:", error);
    if (
      error instanceof Error &&
      error.message.includes("duplicate key value violates unique constraint")
    ) {
      return NextResponse.json(
        { error: "username is already taken" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
