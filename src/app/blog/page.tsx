import { getPosts, getTags } from "@/lib/posts";
import BlogPageClient from "@/components/BlogPageClient";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "blog",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { tag?: string | string[] };
}) {
  const { tag } = searchParams;
  const selectedTags = tag || [];
  const posts = await getPosts(selectedTags);
  const allTags = await getTags();

  return (
    <Suspense fallback={<div>loading...</div>}>
      <BlogPageClient posts={posts} allTags={allTags} />
    </Suspense>
  );
}
