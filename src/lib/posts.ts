import { db } from "./db";
import { PoolClient } from "pg";

export interface Tag {
  id: string;
  name: string;
  post_count: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  author_id: string;
  author: {
    name: string | null;
  };
  tags: Tag[];
}

export async function getPosts(tagNames?: string | string[]): Promise<Post[]> {
  const client = await db.connect();
  try {
    let query = `
      SELECT 
        p.*,
        json_build_object('name', u.name) as author,
        (SELECT COALESCE(json_agg(t.* ORDER BY t.name) FILTER (WHERE t.id IS NOT NULL), '[]'::json)
         FROM tags t
         JOIN posts_tags pt ON t.id = pt.tag_id
         WHERE pt.post_id = p.id) as tags
      FROM posts p
      JOIN users u ON p.author_id = u.id
    `;
    const queryParams: (string[] | number)[] = [];
    const normalizedTagNames = tagNames
      ? Array.isArray(tagNames)
        ? tagNames
        : [tagNames]
      : [];

    if (normalizedTagNames.length > 0) {
      queryParams.push(normalizedTagNames);
      queryParams.push(normalizedTagNames.length);
      query += `
        WHERE p.id IN (
          SELECT pt.post_id
          FROM posts_tags pt
          JOIN tags t ON pt.tag_id = t.id
          WHERE t.name = ANY($1)
          GROUP BY pt.post_id
          HAVING COUNT(t.id) = $2
        )
      `;
    }

    query += " ORDER BY p.created_at DESC";

    const result = await client.query(query, queryParams);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
      SELECT 
        p.*,
        json_build_object('name', u.name) as author,
        (SELECT COALESCE(json_agg(t.* ORDER BY t.name) FILTER (WHERE t.id IS NOT NULL), '[]'::json)
         FROM tags t
         JOIN posts_tags pt ON t.id = pt.tag_id
         WHERE pt.post_id = p.id) as tags
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.slug = $1
    `,
      [slug],
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export interface PostSummary {
  slug: string;
  title: string;
  created_at: string;
  tags: Tag[];
}

export async function getLatestPosts(
  limit: number = 3,
): Promise<PostSummary[]> {
  const client = await db.connect();
  try {
    const result = await client.query(
      `
      SELECT 
        p.slug, 
        p.title, 
        p.created_at,
        (SELECT COALESCE(json_agg(t.* ORDER BY t.name) FILTER (WHERE t.id IS NOT NULL), '[]'::json)
         FROM tags t
         JOIN posts_tags pt ON t.id = pt.tag_id
         WHERE pt.post_id = p.id) as tags
      FROM posts p
      ORDER BY p.created_at DESC
      LIMIT $1
    `,
      [limit],
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getTags(): Promise<Tag[]> {
  const client = await db.connect();
  try {
    const result = await client.query(`
      SELECT 
        t.id, 
        t.name, 
        COUNT(pt.post_id) as post_count
      FROM tags t
      LEFT JOIN posts_tags pt ON t.id = pt.tag_id
      GROUP BY t.id, t.name
      ORDER BY t.name
    `);
    return result.rows;
  } finally {
    client.release();
  }
}

async function upsertTags(
  client: PoolClient,
  tagNames: string[],
): Promise<Tag[]> {
  if (tagNames.length === 0) return [];

  const insertQuery = `
    INSERT INTO tags (name)
    SELECT unnest($1::text[])
    ON CONFLICT (name) DO NOTHING;
  `;
  await client.query(insertQuery, [tagNames]);

  const selectQuery = `
    SELECT * FROM tags WHERE name = ANY($1::text[]);
  `;
  const result = await client.query(selectQuery, [tagNames]);
  return result.rows;
}

export async function createPost(
  slug: string,
  title: string,
  content: string,
  author_id: string,
  tags: string[],
): Promise<Post> {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const insertedPost = await client.query(
      "INSERT INTO posts (slug, title, content, author_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [slug, title, content, author_id],
    );
    const newPost = insertedPost.rows[0];

    if (tags && tags.length > 0) {
      const upsertedTags = await upsertTags(client, tags);
      const tagIds = upsertedTags.map((t) => t.id);

      const postsTagsQuery = `
        INSERT INTO posts_tags (post_id, tag_id)
        VALUES ${tagIds.map((_, i) => `($1, $${i + 2})`).join(", ")}
      `;
      await client.query(postsTagsQuery, [newPost.id, ...tagIds]);
    }

    await client.query("COMMIT");

    const post = await getPostBySlug(newPost.slug);
    if (!post) throw new Error("Failed to create post");
    return post;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function updatePost(
  id: string,
  slug: string,
  title: string,
  content: string,
  tags: string[],
): Promise<Post> {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const updatedPost = await client.query(
      "UPDATE posts SET slug = $1, title = $2, content = $3, updated_at = NOW() WHERE id = $4 RETURNING *",
      [slug, title, content, id],
    );
    const newPost = updatedPost.rows[0];

    await client.query("DELETE FROM posts_tags WHERE post_id = $1", [id]);

    if (tags && tags.length > 0) {
      const upsertedTags = await upsertTags(client, tags);
      const tagIds = upsertedTags.map((t) => t.id);

      const postsTagsQuery = `
        INSERT INTO posts_tags (post_id, tag_id)
        VALUES ${tagIds.map((_, i) => `($1, $${i + 2})`).join(", ")}
      `;
      await client.query(postsTagsQuery, [newPost.id, ...tagIds]);
    }

    await client.query("COMMIT");

    const post = await getPostBySlug(newPost.slug);
    if (!post) throw new Error("Failed to update post");
    return post;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function deletePost(slug: string, userId: string): Promise<void> {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const postCheck = await client.query(
      "SELECT id, author_id FROM posts WHERE slug = $1",
      [slug],
    );

    if (postCheck.rows.length === 0) {
      throw new Error("post not found");
    }

    if (postCheck.rows[0].author_id !== userId) {
      throw new Error("user is not authorized to delete this post");
    }

    await client.query("DELETE FROM posts WHERE slug = $1", [slug]);

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function deleteTag(id: string): Promise<void> {
  const client = await db.connect();
  try {
    await client.query("DELETE FROM tags WHERE id = $1", [id]);
  } finally {
    client.release();
  }
}

export interface AdjacentPost {
  slug: string;
  title: string;
  created_at: string;
}

export async function getAdjacentPosts(currentSlug: string): Promise<{
  previous: AdjacentPost | null;
  next: AdjacentPost | null;
}> {
  const client = await db.connect();
  try {
    // First get the current post's ID
    const currentPostResult = await client.query(
      `SELECT id FROM posts WHERE slug = $1`,
      [currentSlug],
    );

    if (currentPostResult.rows.length === 0) {
      return { previous: null, next: null };
    }

    const currentPostId = currentPostResult.rows[0].id;

    // Get the previous post (with ID less than current)
    const previousResult = await client.query(
      `SELECT slug, title, created_at 
       FROM posts 
       WHERE id < $1 
       ORDER BY id DESC 
       LIMIT 1`,
      [currentPostId],
    );

    // Get the next post (with ID greater than current)
    const nextResult = await client.query(
      `SELECT slug, title, created_at 
       FROM posts 
       WHERE id > $1 
       ORDER BY id ASC 
       LIMIT 1`,
      [currentPostId],
    );

    return {
      previous: previousResult.rows[0] || null,
      next: nextResult.rows[0] || null,
    };
  } finally {
    client.release();
  }
}
