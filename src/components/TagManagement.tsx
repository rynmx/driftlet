"use client";

import { useState, useEffect } from "react";

interface Tag {
  id: string;
  name: string;
}

const TagManagement = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags");
        if (!response.ok) {
          throw new Error("Failed to fetch tags");
        }
        const data = await response.json();
        setTags(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "an unknown error occurred",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`are you sure you want to delete the "${name}" tag?`))
      return;

    try {
      const response = await fetch(`/api/tags?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTags(tags.filter((tag) => tag.id !== id));
      } else {
        const data = await response.json();
        setError(data.error || "failed to delete tag.");
      }
    } catch (err) {
      console.error("delete failed:", err);
      setError("failed to connect to the server.");
    }
  };

  if (isLoading) {
    return <p>loading tags...</p>;
  }

  if (error) {
    return <p className="text-red-500">error: {error}</p>;
  }

  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        click a tag to delete it. this action cannot be undone.
      </p>
      <div className="flex flex-wrap gap-2">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleDelete(tag.id, tag.name)}
              className="bg-transparent border border-black dark:border-gray-700 text-black dark:text-white px-3 py-1 text-sm hover:bg-red-500 hover:border-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:border-red-600 transition-colors duration-200"
              title={`delete "${tag.name}"`}
            >
              {tag.name}
            </button>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">no tags found.</p>
        )}
      </div>
    </div>
  );
};

export default TagManagement;
