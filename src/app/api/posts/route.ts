import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { title, slug, content } = await req.json();

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "missing required fields" },
        { status: 400 },
      );
    }

    // @ts-expect-error -- session.user.id is added in the auth callback
    const userId = session.user.id;

    const client = await db.connect();
    try {
      const result = await client.query(
        "INSERT INTO posts (title, slug, content, author_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [title, slug, content, userId],
      );
      const newPost = result.rows[0];
      return NextResponse.json(newPost, { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("failed to create post:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
