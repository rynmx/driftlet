import Link from "next/link";
import { getPosts } from "@/lib/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "blog",
};

// Helper function to create a simple excerpt
const createExcerpt = (text: string, length = 150) => {
  if (!text || text.length <= length) {
    return text;
  }
  return text.substring(0, length) + "...";
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center sm:text-left text-black dark:text-white">
          blog
        </h1>
        <div className="flex flex-col">
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <div key={post.id}>
                <Link href={`/blog/${post.slug}`} className="block py-6 group">
                  <h2 className="text-xl font-bold text-black dark:text-white group-hover:underline">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(post.created_at).toLocaleDateString("en-us", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mt-4">
                    {createExcerpt(post.content)}
                  </p>
                </Link>
                {index < posts.length - 1 && (
                  <hr className="border-black dark:border-gray-700" />
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-300">
              no posts yet. check back soon.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
