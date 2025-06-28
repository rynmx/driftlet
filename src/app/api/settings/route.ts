import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { withDbConnection } from "@/lib/db";
import bcrypt from "bcryptjs";
import { generatePassphrase, hashPassphrase } from "@/lib/passphrase";

// GET all settings (user and site)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    return await withDbConnection(async (client) => {
      // Fetch user-specific settings
      const userResult = await client.query(
        "SELECT id, username, name, bio, extended_bio, profile_picture_url, links, header_text, header_icon_url, show_header_icon, recovery_passphrase IS NOT NULL as has_recovery_passphrase, recovery_passphrase_created_at FROM users WHERE id = $1",
        [userId],
      );

      if (userResult.rows.length === 0) {
        return NextResponse.json({ error: "user not found" }, { status: 404 });
      }

      // Fetch site-wide settings
      const siteSettingsResult = await client.query(
        "SELECT favicon_url, show_attribution FROM settings WHERE id = 1",
      );

      if (siteSettingsResult.rows.length === 0) {
        // This case should ideally not happen if seeding is correct
        return NextResponse.json(
          { error: "site settings not found" },
          { status: 404 },
        );
      }

      const combinedSettings = {
        ...userResult.rows[0],
        ...siteSettingsResult.rows[0],
      };

      return NextResponse.json(combinedSettings);
    });
  } catch (error) {
    console.error("failed to fetch settings:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}

// PATCH (update) settings
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const userId = session.user.id;

    return await withDbConnection(async (client) => {
      try {
        await client.query("BEGIN");

        // Separate keys for user and settings tables
        const userKeys = [
          "name",
          "bio",
          "extended_bio",
          "profile_picture_url",
          "links",
          "header_text",
          "header_icon_url",
          "show_header_icon",
        ];
        const settingsKeys = ["favicon_url", "show_attribution"];

        const userUpdates: { [key: string]: string | boolean | object | null } =
          {};
        const settingsUpdates: {
          [key: string]: string | boolean | object | null;
        } = {};

        for (const key in body) {
          if (userKeys.includes(key)) {
            userUpdates[key] = body[key];
          } else if (settingsKeys.includes(key)) {
            settingsUpdates[key] = body[key];
          }
        }

        // Handle user-specific updates
        if (Object.keys(userUpdates).length > 0) {
          const setClauses = Object.keys(userUpdates)
            .map((key, i) => `"${key}" = $${i + 1}`)
            .join(", ");
          const values = Object.values(userUpdates);
          await client.query(
            `UPDATE users SET ${setClauses} WHERE id = $${values.length + 1}`,
            [...values, userId],
          );
        }

        // Handle site-wide settings updates
        if (Object.keys(settingsUpdates).length > 0) {
          const setClauses = Object.keys(settingsUpdates)
            .map((key, i) => `"${key}" = $${i + 1}`)
            .join(", ");
          const values = Object.values(settingsUpdates);
          await client.query(
            `UPDATE settings SET ${setClauses} WHERE id = 1`,
            values,
          );
        }

        // Handle password, username and recovery passphrase changes
        const {
          username,
          newPassword,
          currentPassword,
          generateRecoveryPassphrase,
        } = body;
        if (
          newPassword ||
          (username && username !== session.user.name) ||
          generateRecoveryPassphrase
        ) {
          const currentUserResult = await client.query(
            "SELECT * FROM users WHERE id = $1",
            [userId],
          );
          const user = currentUserResult.rows[0];

          let hashedPassword = user.password;
          if (newPassword) {
            if (
              !currentPassword ||
              !bcrypt.compareSync(currentPassword, user.password)
            ) {
              await client.query("ROLLBACK");
              return NextResponse.json(
                { error: "invalid current password" },
                { status: 401 },
              );
            }
            hashedPassword = await bcrypt.hash(newPassword, 12);
            await client.query("UPDATE users SET password = $1 WHERE id = $2", [
              hashedPassword,
              userId,
            ]);
          }

          if (username && username !== user.username) {
            const existingUser = await client.query(
              "SELECT id FROM users WHERE username = $1 AND id != $2",
              [username, userId],
            );
            if (existingUser.rows.length > 0) {
              await client.query("ROLLBACK");
              return NextResponse.json(
                { error: "username is already taken" },
                { status: 409 },
              );
            }
            await client.query("UPDATE users SET username = $1 WHERE id = $2", [
              username,
              userId,
            ]);
          }

          if (generateRecoveryPassphrase) {
            if (
              !currentPassword ||
              !bcrypt.compareSync(currentPassword, user.password)
            ) {
              await client.query("ROLLBACK");
              return NextResponse.json(
                {
                  error:
                    "current password required to generate recovery passphrase",
                },
                { status: 401 },
              );
            }

            const passphrase = generatePassphrase(18); // 5 words for better security
            const hashedPassphrase = await hashPassphrase(passphrase);

            await client.query(
              "UPDATE users SET recovery_passphrase = $1, recovery_passphrase_created_at = NOW() WHERE id = $2",
              [hashedPassphrase, userId],
            );

            userUpdates.recovery_passphrase_plain = passphrase;
          }
        }

        await client.query("COMMIT");

        // Fetch the newly updated combined settings to return
        const updatedUserResult = await client.query(
          "SELECT id, username, name, bio, extended_bio, profile_picture_url, links, header_text, header_icon_url, show_header_icon, recovery_passphrase IS NOT NULL as has_recovery_passphrase, recovery_passphrase_created_at FROM users WHERE id = $1",
          [userId],
        );
        const updatedSiteSettingsResult = await client.query(
          "SELECT favicon_url, show_attribution FROM settings WHERE id = 1",
        );

        const combinedSettings = {
          ...updatedUserResult.rows[0],
          ...updatedSiteSettingsResult.rows[0],
          // Include the plain text passphrase in the response if it was generated
          ...(userUpdates.recovery_passphrase_plain && {
            recovery_passphrase_plain: userUpdates.recovery_passphrase_plain,
          }),
        };

        return NextResponse.json(combinedSettings);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    });
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
