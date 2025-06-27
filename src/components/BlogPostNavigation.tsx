import Link from "next/link";
import { AdjacentPost } from "@/lib/posts";

export default function BlogPostNavigation({
  previous,
  next,
}: {
  previous: AdjacentPost | null;
  next: AdjacentPost | null;
}) {
  if (!previous && !next) {
    return null;
  }

  // Function to truncate title if it's too long
  const truncateTitle = (title: string, maxLength: number = 40) => {
    if (title.length <= maxLength) return title;
    return `${title.substring(0, maxLength)}...`;
  };

  return (
    <div className="mt-12 border-gray-200">
      <div className="flex items-center justify-center mb-6">
        <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700"></div>
        <span className="px-4 text-gray-500 dark:text-gray-400 font-medium text-sm">
          read more
        </span>
        <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {previous && (
          <div className="flex flex-col bg-gray-50 dark:bg-gray-800 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              previous:
            </span>
            <Link
              href={`/blog/${previous.slug}`}
              className="font-medium text-black dark:text-white hover:underline line-clamp-2"
              title={previous.title}
            >
              {truncateTitle(previous.title)}
            </Link>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {new Date(previous.created_at).toLocaleDateString("en-us", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        )}
        {next && (
          <div
            className={`flex flex-col bg-gray-50 dark:bg-gray-800 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${!previous ? "sm:col-start-2" : ""}`}
          >
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              next:
            </span>
            <Link
              href={`/blog/${next.slug}`}
              className="font-medium text-black dark:text-white hover:underline line-clamp-2"
              title={next.title}
            >
              {truncateTitle(next.title)}
            </Link>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {new Date(next.created_at).toLocaleDateString("en-us", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
