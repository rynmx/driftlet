import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";
import EditPostForm from "@/components/EditPostForm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await paramsPromise;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "post not found" };
  }

  return {
    title: `edit: ${post.title}`,
  };
}

const EditPostPage = async ({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await paramsPromise;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // @ts-expect-error -- session.user.id is added in the auth callback
  if (session.user.id !== post.author_id) {
    // Not authorized to edit this post
    notFound();
  }

  return <EditPostForm post={post} />;
};

export default EditPostPage;
