import { withDbConnection } from "@/lib/db";

export interface PublicProfile {
  name: string | null;
  bio: string | null;
  extended_bio: string | null;
  profile_picture_url: string | null;
  links: Record<string, string> | null;
  // User-specific site settings
  header_text: string | null;
  header_icon_url: string | null;
  show_header_icon: boolean | null;
  // Global site settings
  favicon_url: string | null;
  show_attribution: boolean | null;
}

// For this single-user portfolio, we'll just grab the first user and the site settings.
// In a multi-user system, you'd identify the site owner differently.
export async function getPublicProfile(): Promise<PublicProfile | null> {
  try {
    return await withDbConnection(async (client) => {
      // Fetch user-specific settings
      const userResult = await client.query(
        "SELECT name, bio, extended_bio, profile_picture_url, links, header_text, header_icon_url, show_header_icon FROM users LIMIT 1",
      );

      // Fetch site-wide settings
      const siteSettingsResult = await client.query(
        "SELECT favicon_url, show_attribution FROM settings WHERE id = 1",
      );

      if (
        userResult.rows.length === 0 ||
        siteSettingsResult.rows.length === 0
      ) {
        return null;
      }

      const combinedProfile = {
        ...userResult.rows[0],
        ...siteSettingsResult.rows[0],
      };

      return combinedProfile;
    }, "getPublicProfile");
  } catch (error) {
    console.error("failed to fetch public profile:", error);
    // Return null on error to allow the page to render gracefully
    return null;
  }
}
