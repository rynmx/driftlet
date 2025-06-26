"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { Tag } from "@/lib/posts";
import { TagLink } from "./TagLink";

export const TagFilter = ({ allTags }: { allTags: Tag[] }) => {
  const searchParams = useSearchParams();
  const selectedTags = useMemo(
    () => searchParams.getAll("tag"),
    [searchParams],
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleTags = isExpanded ? allTags : allTags.slice(0, 5);

  return (
    <div>
      <p className="text-center sm:text-left text-black dark:text-white text-xs mb-1">
        filter by tag
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center sm:justify-start">
        {visibleTags.map((tag) => (
          <TagLink
            key={tag.id}
            tag={tag}
            isActive={selectedTags.includes(tag.name)}
          />
        ))}
        {allTags.length > 5 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            {isExpanded ? "show less" : `show ${allTags.length - 5} more...`}
          </button>
        )}
      </div>
    </div>
  );
};
