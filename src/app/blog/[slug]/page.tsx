import MarkdownRenderer from "@/components/MarkdownRenderer";
import { getPostBySlug, getAdjacentPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { PostTagList } from "@/components/PostTagList";
import BlogPostNavigation from "@/components/BlogPostNavigation";
import AuthorProfileCard from "@/components/AuthorProfileCard";
import { getPublicProfile } from "@/lib/user";
import type { Metadata } from "next";

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await paramsPromise;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "post not found",
    };
  }

  return {
    title: post.title,
    description: post.content.substring(0, 160),
  };
}

export default async function BlogPostPage({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await paramsPromise;
  const post = await getPostBySlug(slug);
  const session = await getServerSession(authOptions);
  const profile = await getPublicProfile();

  if (!post) {
    notFound();
  }

  // Get adjacent posts for navigation
  const adjacentPosts = await getAdjacentPosts(slug);
  const isAuthor = session?.user?.id === post.author_id;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24">
      <article className="w-full max-w-2xl">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold mb-2 text-black dark:text-white">
            {post.title}
          </h1>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span>
              {new Date(post.created_at).toLocaleDateString("en-us", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            {post.author.name && (
              <span className="ml-2">by {post.author.name}</span>
            )}
            {post.updated_at &&
              new Date(post.updated_at).getTime() !==
                new Date(post.created_at).getTime() && (
                <span className="ml-2">
                  (last edited on{" "}
                  {new Date(post.updated_at).toLocaleDateString("en-us", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  )
                </span>
              )}
          </div>

          <PostTagList tags={post.tags} />

          {isAuthor && (
            <Link
              href={`/admin/edit/${post.slug}`}
              className="text-sm text-blue-500 hover:underline mt-2 inline-block"
            >
              edit post
            </Link>
          )}
        </div>
        <div className="prose dark:prose-invert max-w-none">
          <MarkdownRenderer>{post.content}</MarkdownRenderer>
        </div>

        {/* Author Profile */}
        {profile && <AuthorProfileCard profile={profile} />}

        {/* Blog post navigation */}
        <BlogPostNavigation
          previous={adjacentPosts.previous}
          next={adjacentPosts.next}
        />
      </article>
    </main>
  );
}
