import { db } from '@/lib/db';

export interface PublicProfile {
  name: string | null;
  bio: string | null;
  extended_bio: string | null;
  profile_picture_url: string | null;
  header_text: string | null;
  header_icon_link: string | null;
  connections: Record<string, string> | null;
  show_attribution: boolean | null;
}

// For this single-user portfolio, we'll just grab the first user.
// In a multi-user system, you'd identify the site owner differently.
export async function getPublicProfile(): Promise<PublicProfile | null> {
  const client = await db.connect();
  try {
    const result = await client.query(
      'SELECT name, bio, extended_bio, profile_picture_url, header_text, header_icon_link, connections, show_attribution FROM users LIMIT 1'
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('failed to fetch public profile:', error);
    // Return null on error to allow the page to render gracefully
    return null;
  } finally {
    client.release();
  }
}
