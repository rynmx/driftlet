import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createPost } from "@/lib/posts";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { title, slug, content, tags } = await req.json();

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "missing required fields" },
        { status: 400 },
      );
    }

    const newPost = await createPost(
      slug,
      title,
      content,
      session.user.id,
      tags || [],
    );

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("failed to create post:", error);
    if (
      error instanceof Error &&
      error.message.includes(
        'duplicate key value violates unique constraint "posts_slug_key"',
      )
    ) {
      return NextResponse.json(
        { error: "slug is already taken" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
