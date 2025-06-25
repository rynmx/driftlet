"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (result?.ok) {
      router.push("/"); // Redirect to home on success
    } else {
      // The page will reload with an error query parameter
      router.push("/login?error=CredentialsSignin");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24">
      <div className="w-full max-w-xs">
        <h1 className="text-2xl font-bold mb-8 text-center text-black dark:text-white">
          login
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            required
          />
          <button
            type="submit"
            className="p-2 font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity"
          >
            sign in
          </button>
          {error && (
            <p className="text-sm text-center text-red-500">
              sign in failed. please check your credentials.
            </p>
          )}
        </form>
      </div>
    </main>
  );
};

export default LoginForm;
