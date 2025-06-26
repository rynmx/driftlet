import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getTags, deleteTag } from "@/lib/posts";

export async function GET() {
  try {
    const tags = await getTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error("failed to fetch tags:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "tag id is required" },
        { status: 400 },
      );
    }

    await deleteTag(id);
    return NextResponse.json({ message: "tag deleted successfully" });
  } catch (error) {
    console.error("failed to delete tag:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
