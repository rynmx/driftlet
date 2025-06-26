"use client";

import type { Tag } from "@/lib/posts";

export const PostPreviewTagList = ({
  tags,
}: {
  tags: Tag[];
}) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  const visibleTags = tags.slice(0, 3);

  return (
    <div className="hidden sm:flex flex-wrap items-baseline gap-x-2 gap-y-2">
      {visibleTags.map((tag) => (
        <span
          key={tag.id}
          className="text-sm text-gray-500 dark:text-gray-400 transition-colors hover:text-black dark:hover:text-white"
        >
          #{tag.name}
        </span>
      ))}
      {tags.length > 3 && (
        <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors hover:text-black dark:hover:text-white">
          +{tags.length - 3} more
        </span>
      )}
    </div>
  );
};
