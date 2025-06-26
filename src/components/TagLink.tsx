"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Tag {
  id: string;
  name: string;
  post_count: string;
}

export const TagLink = ({
  tag,
  isActive,
  asSpan,
}: {
  tag: Tag;
  isActive: boolean;
  asSpan?: boolean;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    const tags = current.getAll("tag");

    if (isActive) {
      const newTags = tags.filter((t) => t !== tag.name);
      current.delete("tag");
      newTags.forEach((t) => current.append("tag", t));
    } else {
      current.append("tag", tag.name);
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  };

  const className = `text-sm transition-colors hover:text-black dark:hover:text-white ${
    isActive
      ? "font-bold text-black dark:text-white"
      : "text-gray-500 dark:text-gray-400"
  }`;

  if (asSpan) {
    return (
      <span className={className}>
        #{tag.name} ({tag.post_count})
      </span>
    );
  }

  return (
    <a href="#" onClick={handleClick} className={className}>
      #{tag.name} ({tag.post_count})
    </a>
  );
};
