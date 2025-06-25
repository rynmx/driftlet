"use client";

import { useEffect, useState } from "react";

export default function Setup() {
  const [settingUp, setSettingUp] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setupDatabase() {
      try {
        const response = await fetch("/api/setup", { method: "POST" });
        if (!response.ok) {
          throw new Error("Failed to setup database");
        }
        // Refresh the page to show the initialized app
        window.location.reload();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
        setSettingUp(false);
      }
    }

    setupDatabase();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 sm:p-24 text-center">
      <div className="z-10 w-full max-w-2xl flex flex-col items-center gap-4">
        {settingUp && (
          <>
            <h1 className="text-2xl font-bold">setting up driftlet...</h1>
            <p className="text-gray-600 dark:text-gray-400">
              this may take a moment. please don&apos;t refresh the page.
            </p>
          </>
        )}
        {error && (
          <>
            <h1 className="text-2xl font-bold text-red-500">setup failed</h1>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <p className="text-gray-600 dark:text-gray-400">
              please check the server logs for more information.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
