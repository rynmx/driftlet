import { withDbConnection } from "@/lib/db";

export interface SiteSettings {
  site_name: string | null;
  header_text: string | null;
  header_icon_link: string | null;
  show_attribution: boolean | null;
}

// For this single-user portfolio, we'll just grab the first user.
// In a multi-user system, you'd identify the site owner differently.
export async function getSettings(): Promise<SiteSettings | null> {
  try {
    return await withDbConnection(async (client) => {
      const result = await client.query(
        "SELECT site_name, header_text, header_icon_link, show_attribution FROM users LIMIT 1",
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    }, "getSettings");
  } catch (error) {
    console.error("failed to fetch settings:", error);
    // Return null on error to allow the page to render gracefully
    return null;
  }
}
