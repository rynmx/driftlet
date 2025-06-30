"use client";

import { useState } from "react";
import Link from "next/link";
import type { Tag } from "@/lib/posts";

export const PostTagList = ({ tags }: { tags: Tag[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!tags || tags.length === 0) {
    return null;
  }

  const visibleTags = isExpanded ? tags : tags.slice(0, 5);

  return (
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center sm:justify-start">
      {visibleTags.map((tag) => (
        <Link
          key={tag.id}
          href={`/post?tag=${tag.name}`}
          className="text-sm text-gray-500 dark:text-gray-400 transition-colors hover:text-black dark:hover:text-white"
        >
          #{tag.name}
        </Link>
      ))}
      {tags.length > 5 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
        >
          {isExpanded ? "show less" : `show ${tags.length - 5} more...`}
        </button>
      )}
    </div>
  );
};
