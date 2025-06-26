"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { Post, Tag } from "@/lib/posts";
import { TagFilter } from "./TagFilter";
import { PostPreviewTagList } from "./PostPreviewTagList";

const createExcerpt = (text: string, length = 150) => {
  if (!text || text.length <= length) {
    return text;
  }
  return text.substring(0, length) + "...";
};

export default function BlogPageClient({
  posts,
  allTags,
}: {
  posts: Post[];
  allTags: Tag[];
}) {
  const searchParams = useSearchParams();
  const selectedTags = useMemo(
    () => searchParams.getAll("tag"),
    [searchParams],
  );

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-4 text-center sm:text-left text-black dark:text-white">
          blog
        </h1>

        <div className="mb-8">
          <TagFilter allTags={allTags} />
        </div>

        <div className="flex flex-col">
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <div key={post.id}>
                <Link href={`/blog/${post.slug}`} className="block py-6 group">
                  <h2 className="text-xl font-bold text-black dark:text-white group-hover:underline truncate">
                    {post.title}
                  </h2>
                  <div className="flex items-baseline flex-wrap gap-x-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span>
                      {new Date(post.created_at).toLocaleDateString("en-us", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    {post.tags && post.tags.length > 0 && (
                      <span className="hidden sm:inline">•</span>
                    )}
                    <PostPreviewTagList tags={post.tags} />
                  </div>
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
              no posts found{" "}
              {selectedTags.length > 0
                ? `with the tag(s): ${selectedTags.join(", ")}`
                : ""}
              .
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
