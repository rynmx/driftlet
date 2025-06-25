"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

const AuthNavLinks = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
    );
  }

  if (session) {
    return (
      <>
        <Link
          href="/admin/create"
          className="font-medium text-black dark:text-white hover:underline"
        >
          new
        </Link>
        <Link
          href="/settings"
          className="font-medium text-black dark:text-white hover:underline"
        >
          settings
        </Link>
        <button
          onClick={() => signOut()}
          className="font-medium text-black dark:text-white hover:underline"
        >
          logout
        </button>
      </>
    );
  }

  // If you wanted to show a login link to non-authenticated users, you could return it here.
  return null;
};

export default AuthNavLinks;
