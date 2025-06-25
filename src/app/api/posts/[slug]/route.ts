import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { getPostBySlug } from '@/lib/posts';

// GET a single post by slug
export async function GET(
  req: Request,
  { params: { slug } }: { params: { slug: string } }
) {
  try {
    const post = await getPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: 'post not found' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error('failed to fetch post:', error);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}

// PUT (update) a post
export async function PUT(
  req: Request,
  { params: { slug: oldSlug } }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const { title, slug: newSlug, content } = await req.json();

    if (!title || !newSlug || !content) {
      return NextResponse.json({ error: 'missing required fields' }, { status: 400 });
    }

    // @ts-expect-error -- session.user.id is added in the auth callback
    const userId = session.user.id;

    const client = await db.connect();
    try {
      // First, verify the user owns the post
      const postCheck = await client.query('SELECT author_id FROM posts WHERE slug = $1', [oldSlug]);
      if (postCheck.rows.length === 0) {
        return NextResponse.json({ error: 'post not found' }, { status: 404 });
      }
      if (postCheck.rows[0].author_id !== userId) {
        return NextResponse.json({ error: 'forbidden' }, { status: 403 });
      }

      // Update the post
      const result = await client.query(
        'UPDATE posts SET title = $1, slug = $2, content = $3, updated_at = NOW() WHERE slug = $4 RETURNING *',
        [title, newSlug, content, oldSlug]
      );
      
      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('failed to update post:', error);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}

// DELETE a post
export async function DELETE(
  req: Request,
  { params: { slug } }: { params: { slug: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    try {
        // @ts-expect-error -- session.user.id is added in the auth callback
        const userId = session.user.id;

        const client = await db.connect();
        try {
            // Verify ownership before deleting
            const postCheck = await client.query('SELECT author_id FROM posts WHERE slug = $1', [slug]);
            if (postCheck.rows.length === 0) {
                return NextResponse.json({ error: 'post not found' }, { status: 404 });
            }
            if (postCheck.rows[0].author_id !== userId) {
                return NextResponse.json({ error: 'forbidden' }, { status: 403 });
            }

            await client.query('DELETE FROM posts WHERE slug = $1', [slug]);
            return NextResponse.json({ message: 'post deleted successfully' }, { status: 200 });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('failed to delete post:', error);
        return NextResponse.json({ error: 'internal server error' }, { status: 500 });
    }
}
