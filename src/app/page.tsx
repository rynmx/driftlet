import { getPublicProfile } from "@/lib/user";
import { getLatestPosts } from "@/lib/posts";
import Image from "next/image";
import Link from "next/link";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { FiArrowUpRight } from "react-icons/fi";

export default async function Home() {
  const profile = await getPublicProfile();
  const latestPosts = await getLatestPosts();

  // Show the welcome message if the profile doesn't exist or is incomplete.
  if (!profile || !profile.name) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 sm:p-24 text-center">
        <div className="z-10 w-full max-w-2xl flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold">welcome to driftlet</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            a minimalist, self-hostable portfolio and blog.
          </p>
          <p className="mt-4 text-sm">
            to get started,{" "}
            <Link href="/login" className="underline">
              log in
            </Link>{" "}
            and customize your site via the{" "}
            <Link href="/settings" className="underline">
              settings
            </Link>{" "}
            page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24">
      <div className="z-10 w-full max-w-2xl flex flex-col gap-12">
        {/* Profile Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {profile.profile_picture_url && (
            <Image
              src={profile.profile_picture_url}
              alt={profile.name || "profile picture"}
              width={100}
              height={100}
              className="rounded-full object-cover w-[100px] h-[100px]" // Added object-cover and fixed size
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">
              {profile.name}
            </h1>
            <p className="text-md text-gray-600 dark:text-gray-400 mt-1">
              {profile.bio}
            </p>
          </div>
        </div>

        {/* Extended Bio Section */}
        {profile.extended_bio && (
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white">
              about
            </h2>
            <hr className="my-2 border-gray-200 dark:border-gray-700" />
            <article className="prose dark:prose-invert max-w-none">
              <MarkdownRenderer>{profile.extended_bio}</MarkdownRenderer>
            </article>
          </div>
        )}

        {/* Connections Section */}
        {profile.links && Object.keys(profile.links).length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white">
              links
            </h2>
            <hr className="my-2 border-gray-200 dark:border-gray-700" />
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {Object.entries(profile.links).map(([key, value]) => (
                <Link
                  key={key}
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-1 text-black dark:text-white hover:underline"
                >
                  {key}
                  <FiArrowUpRight
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    size=".75em"
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Latest Updates Section */}
        {latestPosts && latestPosts.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white">
              latest updates
            </h2>
            <hr className="my-2 border-gray-200 dark:border-gray-700" />
            <div className="flex flex-col gap-4">
              {latestPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group"
                >
                  <h3 className="font-semibold text-black dark:text-white group-hover:underline">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
