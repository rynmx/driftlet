import MarkdownRenderer from '@/components/MarkdownRenderer';
import { getPostBySlug, getPosts } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import type { Metadata } from 'next';

export async function generateMetadata({ params: paramsPromise }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await paramsPromise;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'post not found',
    };
  }

  return {
    title: post.title,
    description: post.content.substring(0, 160),
  };
}

// This function tells Next.js which slugs are available at build time.
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  const { slug } = await paramsPromise;
  const post = await getPostBySlug(slug);
  const session = await getServerSession(authOptions);

  if (!post) {
    notFound();
  }

  // @ts-expect-error -- session.user.id is added in the auth callback
  const isAuthor = session?.user?.id === post.author_id;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24">
      <article className="w-full max-w-2xl">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold mb-2 text-black dark:text-white">{post.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(post.created_at).toLocaleDateString('en-us', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          {isAuthor && (
            <Link href={`/admin/edit/${post.slug}`} className="text-sm text-blue-500 hover:underline mt-2 inline-block">
              edit post
            </Link>
          )}
        </div>
                <div className="prose dark:prose-invert max-w-none">
          <MarkdownRenderer>{post.content}</MarkdownRenderer>
        </div>
      </article>
    </main>
  );
}
