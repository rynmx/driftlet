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
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <fieldset className="flex flex-col gap-4 border border-black dark:border-gray-700 p-4">
            <legend className="text-lg font-semibold px-2 text-black dark:text-white">
              sign in
            </legend>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full"
                required
              />
            </div>

            <div className="mt-2">
              <button
                type="submit"
                className="w-full p-2 font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity"
              >
                sign in
              </button>
            </div>

            {error && (
              <p className="text-sm text-center text-red-500">
                sign in failed. please check your credentials.
              </p>
            )}

            <div className="text-center mt-2">
              <a
                href="/recover"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                forgot password?
              </a>
            </div>
          </fieldset>
        </form>
      </div>
    </main>
  );
};

export default LoginForm;
