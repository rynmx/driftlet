"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

enum RecoveryStep {
  VERIFY = "verify",
  RESET = "reset",
  SUCCESS = "success",
}

export default function PasswordRecovery() {
  const router = useRouter();
  const [step, setStep] = useState<RecoveryStep>(RecoveryStep.VERIFY);
  const [username, setUsername] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerifyCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Just verify the passphrase exists and is valid without changing password yet
      const response = await fetch("/api/password-recovery/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, passphrase }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify recovery credentials");
      }

      // If verification successful, move to password reset step
      setStep(RecoveryStep.RESET);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/password-recovery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          passphrase,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setStep(RecoveryStep.SUCCESS);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24">
      <div className="w-full max-w-md">
        <form
          onSubmit={
            step === RecoveryStep.VERIFY
              ? handleVerifyCredentials
              : handleResetPassword
          }
        >
          <fieldset className="flex flex-col gap-4 border border-black dark:border-gray-700 p-4">
            <legend className="text-lg font-semibold px-2 text-black dark:text-white">
              password recovery
            </legend>

            {error && (
              <p className="text-sm text-center text-red-500">{error}</p>
            )}

            {step === RecoveryStep.VERIFY && (
              <>
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="username"
                    className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full"
                  />
                </div>

                <div>
                  <label
                    htmlFor="passphrase"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    recovery passphrase
                  </label>
                  <textarea
                    id="passphrase"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    required
                    placeholder="enter your existing recovery passphrase"
                    className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full min-h-[100px] resize-y font-mono text-sm"
                  />
                </div>

                <div className="mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full p-2 font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity disabled:opacity-50"
                  >
                    {loading ? "verifying..." : "verify credentials"}
                  </button>
                </div>
              </>
            )}

            {step === RecoveryStep.RESET && (
              <>
                <div className="p-3 bg-green-100 dark:bg-green-900 border border-green-500 rounded-md mb-4">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-bold text-green-800 dark:text-green-300">
                      credentials verified
                    </h4>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    you can now set a new password for your account
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    new password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="new password"
                    className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    confirm password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="confirm password"
                    className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full"
                  />
                </div>

                <div className="mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full p-2 font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity disabled:opacity-50"
                  >
                    {loading ? "processing..." : "reset password"}
                  </button>
                </div>
              </>
            )}

            {step === RecoveryStep.SUCCESS && (
              <div className="text-center space-y-4">
                <p className="text-sm text-green-500">
                  password has been reset successfully!
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="w-full p-2 font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity"
                >
                  go to login
                </button>
              </div>
            )}

            <div className="text-center mt-2">
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                return to login
              </Link>
            </div>
          </fieldset>
        </form>
      </div>
    </main>
  );
}
