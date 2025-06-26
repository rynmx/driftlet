"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Post } from "@/lib/posts";

const EditPostForm = ({ post }: { post: Post }) => {
  const router = useRouter();

  const [title, setTitle] = useState(post.title);
  const [newSlug, setNewSlug] = useState(post.slug);
  const [content, setContent] = useState(post.content);
  const [tags, setTags] = useState(post.tags.map((t) => t.name).join(", "));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/posts/${post.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: newSlug,
          content,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t),
        }),
      });

      if (response.ok) {
        router.push(`/blog/${newSlug}`);
      } else {
        const data = await response.json();
        setError(data.error || "an unknown error occurred.");
      }
    } catch (err) {
      console.error("update failed:", err);
      setError("failed to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("are you sure you want to delete this post?")) {
      try {
        const response = await fetch(`/api/posts/${post.slug}`, {
          method: "DELETE",
        });
        if (response.ok) {
          router.push("/blog");
        } else {
          const data = await response.json();
          setError(data.error || "failed to delete post.");
        }
      } catch (err) {
        console.error("delete failed:", err);
        setError("failed to connect to the server.");
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-8 text-center sm:text-left text-black dark:text-white">
          edit post
        </h1>
        <form onSubmit={handleUpdate} className="flex flex-col gap-8">
          <fieldset className="flex flex-col gap-4 border border-black dark:border-gray-700 p-4">
            <legend className="text-lg font-semibold px-2 text-black dark:text-white">
              content
            </legend>
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="post title"
                className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full"
                required
              />
            </div>
            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                slug
              </label>
              <input
                id="slug"
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="post-slug"
                className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                be careful: changing the slug will break existing links to this
                post.
              </p>
            </div>
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="write your post content here. markdown is supported."
                className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white min-h-[300px] w-full"
                required
              />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-4 border border-black dark:border-gray-700 p-4">
            <legend className="text-lg font-semibold px-2 text-black dark:text-white">
              metadata
            </legend>
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                tags
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="enter tags, separated by commas"
                className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                separate tags with a comma (e.g., nextjs, programming, webdev).
              </p>
            </div>
          </fieldset>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-grow p-2 font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? "updating..." : "update post"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex-grow p-2 font-bold bg-red-600 text-white hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              delete post
            </button>
          </div>
          {error && (
            <p className="text-sm text-center text-red-500 mt-4">{error}</p>
          )}
        </form>
      </div>
    </main>
  );
};

export default EditPostForm;
