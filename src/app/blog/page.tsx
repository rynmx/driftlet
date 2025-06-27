import { getPosts, getTags } from "@/lib/posts";
import BlogPageClient from "@/components/BlogPageClient";
import LoadingBlogPage from "@/components/LoadingBlogPage";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "blog",
};

export default async function BlogPage(props: {
  searchParams: Promise<{ tag?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const { tag } = searchParams;
  const selectedTags = tag || [];
  const posts = await getPosts(selectedTags);
  const allTags = await getTags();

  return (
    <Suspense fallback={<LoadingBlogPage />}>
      <BlogPageClient posts={posts} allTags={allTags} />
    </Suspense>
  );
}
