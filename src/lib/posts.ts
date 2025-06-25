import { db } from "./db";

export interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
}

export async function getPosts(): Promise<Post[]> {
  const client = await db.connect();
  try {
    const result = await client.query(
      "SELECT * FROM posts ORDER BY created_at DESC",
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const client = await db.connect();
  try {
    const result = await client.query("SELECT * FROM posts WHERE slug = $1", [
      slug,
    ]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export interface PostSummary {
  slug: string;
  title: string;
  created_at: string;
}

export async function getLatestPosts(
  limit: number = 3,
): Promise<PostSummary[]> {
  const client = await db.connect();
  try {
    const result = await client.query(
      "SELECT slug, title, created_at FROM posts ORDER BY created_at DESC LIMIT $1",
      [limit],
    );
    return result.rows;
  } finally {
    client.release();
  }
}
