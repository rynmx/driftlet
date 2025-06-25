import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

// GET user settings
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    // @ts-expect-error -- session.user.id is added in the auth callback
    const userId = session.user.id;
    const client = await db.connect();
    try {
      const result = await client.query(
        'SELECT name, bio, extended_bio, profile_picture_url, header_text, header_icon_link, connections, show_attribution FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'user not found' }, { status: 404 });
      }

      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('failed to fetch settings:', error);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}

// PUT (update) user settings
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
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
      connections,
      show_attribution,
    } = body;

    // @ts-expect-error -- session.user.id is added in the auth callback
    const userId = session.user.id;

    const client = await db.connect();
    try {
      const result = await client.query(
        `UPDATE users SET 
          name = $1, 
          bio = $2, 
          extended_bio = $3, 
          profile_picture_url = $4, 
          header_text = $5, 
          header_icon_link = $6, 
          connections = $7,
          show_attribution = $8
        WHERE id = $9 RETURNING *`,
        [
          name,
          bio,
          extended_bio,
          profile_picture_url,
          header_text,
          header_icon_link,
          JSON.stringify(connections), // Ensure connections are stored as a JSON string
          show_attribution,
          userId,
        ]
      );

      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('failed to update settings:', error);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}
