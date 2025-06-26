import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getPostBySlug, updatePost, deletePost } from "@/lib/posts";

// GET a single post by slug
export async function GET(
  req: Request,
  { params: paramsPromise }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await paramsPromise;
  try {
    const post = await getPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: "post not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error("failed to fetch post:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}

// PUT (update) a post
export async function PUT(
  req: Request,
  { params: paramsPromise }: { params: Promise<{ slug: string }> },
) {
  const { slug: oldSlug } = await paramsPromise;
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { title, slug: newSlug, content, tags } = await req.json();

    if (!title || !newSlug || !content) {
      return NextResponse.json(
        { error: "missing required fields" },
        { status: 400 },
      );
    }

    const post = await getPostBySlug(oldSlug);

    if (!post) {
      return NextResponse.json({ error: "post not found" }, { status: 404 });
    }

    if (post.author_id !== session.user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const updatedPost = await updatePost(
      post.id,
      newSlug,
      title,
      content,
      tags || [],
    );

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("failed to update post:", error);
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

// DELETE a post
export async function DELETE(
  req: Request,
  { params: paramsPromise }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await paramsPromise;
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await deletePost(slug, session.user.id);
    return NextResponse.json(
      { message: "post deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("failed to delete post:", error);
    if (error instanceof Error) {
      if (error.message === "post not found") {
        return NextResponse.json({ error: "post not found" }, { status: 404 });
      }
      if (error.message === "user is not authorized to delete this post") {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
