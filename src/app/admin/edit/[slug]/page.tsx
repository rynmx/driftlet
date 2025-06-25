'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Post } from '@/lib/posts';

const EditPostPage = () => {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (title) {
      document.title = `edit: ${title}`;
    }
  }, [title]);

  useEffect(() => {
    if (slug) {
      const fetchPost = async () => {
        const response = await fetch(`/api/posts/${slug}`);
        if (response.ok) {
          const data: Post = await response.json();
          setPost(data);
          setTitle(data.title);
          setNewSlug(data.slug);
          setContent(data.content);
        } else {
          setError('failed to fetch post data.');
        }
      };
      fetchPost();
    }
  }, [slug]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/posts/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug: newSlug, content }),
      });

      if (response.ok) {
        router.push(`/blog/${newSlug}`);
      } else {
        const data = await response.json();
        setError(data.error || 'an unknown error occurred.');
      }
    } catch (err) {
      console.error('update failed:', err);
      setError('failed to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('are you sure you want to delete this post?')) {
      try {
        const response = await fetch(`/api/posts/${slug}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          router.push('/blog');
        } else {
          const data = await response.json();
          setError(data.error || 'failed to delete post.');
        }
      } catch (err) {
        console.error('delete failed:', err);
        setError('failed to connect to the server.');
      }
    }
  };

  if (status === 'loading' || !post) {
    return <main className="flex min-h-screen flex-col items-center justify-center"><p>loading...</p></main>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-8 text-center sm:text-left text-black dark:text-white">edit post</h1>
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="post title" className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" required />
          <input type="text" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="post-slug" className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" required />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="post content" className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white min-h-[300px]" required />
          <div className="flex flex-col sm:flex-row gap-4">
            <button type="submit" disabled={isSubmitting} className="flex-grow p-2 font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity disabled:opacity-50">
              {isSubmitting ? 'updating...' : 'update post'}
            </button>
            <button type="button" onClick={handleDelete} className="flex-grow p-2 font-bold bg-red-600 text-white hover:opacity-80 transition-opacity disabled:opacity-50">
              delete post
            </button>
          </div>
          {error && <p className="text-sm text-center text-red-500 mt-4">{error}</p>}
        </form>
      </div>
    </main>
  );
};

export default EditPostPage;
