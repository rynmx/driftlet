import { getPosts, getTags } from "@/lib/posts";
import PostPageClient from "@/components/PostPageClient";
import LoadingPostPage from "@/components/LoadingPostPage";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "blog",
};

export default async function PostPage(props: {
  searchParams: Promise<{ tag?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const { tag } = searchParams;
  const selectedTags = tag || [];
  const posts = await getPosts(selectedTags);
  const allTags = await getTags();

  return (
    <Suspense fallback={<LoadingPostPage />}>
      <PostPageClient posts={posts} allTags={allTags} />
    </Suspense>
  );
}
