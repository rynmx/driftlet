"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import zxcvbn from "zxcvbn";
import { useRouter } from "next/navigation";
import TagManagement from "./TagManagement";

interface UserSettings {
  username: string;
  name: string | null;
  bio: string | null;
  extended_bio: string | null;
  profile_picture_url: string | null;
  // User-specific site settings
  header_text: string | null;
  header_icon_url: string | null;
  show_header_icon: boolean;
  links: Record<string, string>;
  // Global site settings
  favicon_url: string | null;
  show_attribution: boolean;
  // Recovery passphrase status
  has_recovery_passphrase: boolean;
  recovery_passphrase_created_at: string | null;
  // Optional response data
  recovery_passphrase_plain?: string;
}

const SettingsForm = () => {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login");
    },
  });

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [linksStr, setLinksStr] = useState("");
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [recoveryPassphrase, setRecoveryPassphrase] = useState("");

  // Debug recovery passphrase state
  useEffect(() => {
    console.log(
      "Recovery passphrase state:",
      recoveryPassphrase ? "present" : "empty",
    );
  }, [recoveryPassphrase]);

  useEffect(() => {
    const fetchSettings = async () => {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setUsername(data.username || "");
        setLinksStr(JSON.stringify(data.links || {}, null, 2));
      } else {
        setError("failed to fetch settings.");
      }
    };
    fetchSettings();
  }, []);

  const generateNewPassphrase = async () => {
    console.log("Generating new recovery passphrase...");
    if (!currentPassword) {
      setError(
        "current password is required to generate a recovery passphrase",
      );
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");
    setRecoveryPassphrase(""); // Clear any previous passphrase

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generateRecoveryPassphrase: true,
          currentPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Recovery passphrase response:", data);
        setSuccessMessage("recovery passphrase generated successfully!");

        // Display the new recovery passphrase
        if (data.recovery_passphrase_plain) {
          // Set the recovery passphrase to display in the UI
          setRecoveryPassphrase(data.recovery_passphrase_plain);

          // Update the settings object with the latest data from the API response
          setSettings((prevSettings) => {
            if (!prevSettings) return null;
            return {
              ...prevSettings,
              has_recovery_passphrase: true, // Mark that a recovery passphrase exists
              recovery_passphrase_created_at: new Date().toISOString(),
            };
          });
        } else {
          console.error("API response missing recovery_passphrase_plain");
        }
      } else {
        const data = await response.json();
        setError(data.error || "failed to generate recovery passphrase");
      }
    } catch (err) {
      console.error("passphrase generation failed:", err);
      setError("failed to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");
    setRecoveryPassphrase(""); // Clear any previous passphrase - this also hides the passphrase section

    let parsedLinks;
    try {
      parsedLinks = JSON.parse(linksStr);
    } catch {
      setError("links field contains invalid json.");
      setIsSubmitting(false);
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("new passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    // We don't need to include recovery passphrase generation in the general form update
    // as we have a dedicated function for it now

    const payload = {
      ...settings,
      links: parsedLinks,
      username,
      ...(newPassword && { currentPassword, newPassword }),
    };

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage("settings updated successfully!");

        // If a recovery passphrase was generated, display it
        if (data.recovery_passphrase_plain) {
          setRecoveryPassphrase(data.recovery_passphrase_plain); // Setting this will show the passphrase section
        }
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;
    const { name, checked } = e.target;
    setSettings({ ...settings, [name]: checked });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!settings) return;
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  if (status === "loading" || !settings) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <p>loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-8 text-center sm:text-left text-black dark:text-white">
          settings
        </h1>
        <form onSubmit={handleUpdate} className="flex flex-col gap-8">
          <fieldset className="flex flex-col gap-4 border border-black dark:border-gray-700 p-4">
            <legend className="text-lg font-semibold px-2 text-black dark:text-white">
              profile
            </legend>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={settings.name || ""}
                onChange={handleInputChange}
                placeholder="your name"
                className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full"
              />
            </div>
            <div>
              <label
                htmlFor="profile_picture_url"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                profile picture url
              </label>
              <input
                id="profile_picture_url"
                type="text"
                name="profile_picture_url"
                value={settings.profile_picture_url || ""}
                onChange={handleInputChange}
                placeholder="profile picture url"
                className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full"
              />
            </div>
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={settings.bio || ""}
                onChange={handleInputChange}
                placeholder="short bio (one-liner)"
                className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full"
              />
            </div>
            <div>
              <label
                htmlFor="extended_bio"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                extended bio
              </label>
              <textarea
                id="extended_bio"
                name="extended_bio"
                value={settings.extended_bio || ""}
                onChange={handleInputChange}
                placeholder="extended bio (markdown supported)"
                className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white min-h-[200px] w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                links (json)
              </label>
              <textarea
                value={linksStr}
                onChange={(e) => setLinksStr(e.target.value)}
                placeholder='{
  "github": "https://github.com/username",
  "twitter": "https://twitter.com/username"
}'
                className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white min-h-[150px] w-full font-mono text-sm"
              />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-4 border border-black dark:border-gray-700 p-4">
            <legend className="text-lg font-semibold px-2 text-black dark:text-white">
              account
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
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your username"
                className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full"
              />
            </div>
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                current password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="required to change password"
                className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full"
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                new password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  const password = e.target.value;
                  setNewPassword(password);
                  if (password) {
                    const result = zxcvbn(password);
                    setPasswordStrength({
                      score: result.score,
                      feedback: result.feedback.suggestions[0] || "Strong",
                    });
                  } else {
                    setPasswordStrength({ score: 0, feedback: "" });
                  }
                }}
                placeholder="leave blank to keep current"
                className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full"
              />
              {newPassword && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        [
                          "bg-red-500",
                          "bg-red-500",
                          "bg-yellow-500",
                          "bg-blue-500",
                          "bg-green-500",
                        ][passwordStrength.score]
                      }`}
                      style={{
                        width: `${(passwordStrength.score / 4) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                    {passwordStrength.feedback}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="confirm new password"
                className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full"
              />
            </div>

            {/* Recovery Passphrase Section */}
            {!recoveryPassphrase ? (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-medium mb-2 text-black dark:text-white">
                  recovery passphrase
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      status:
                      <span
                        className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${settings.has_recovery_passphrase ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"}`}
                      >
                        {settings.has_recovery_passphrase
                          ? "enabled"
                          : "not set"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {settings.has_recovery_passphrase
                        ? "you have a recovery passphrase set for account recovery."
                        : "set up a recovery passphrase to help recover your account if needed."}
                    </p>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={generateNewPassphrase}
                    disabled={isSubmitting}
                    className="px-3 py-1.5 text-sm border border-black dark:border-gray-700 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white transition-colors disabled:opacity-50"
                  >
                    generate new passphrase
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    requires your current password for security.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 mt-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-500 rounded-md">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-300">
                    your recovery passphrase
                  </h4>
                </div>
                <p className="text-xs mb-2 text-yellow-700 dark:text-yellow-400">
                  save this passphrase somewhere secure. it can be used to
                  recover your account if you forget your password.
                </p>
                <div className="p-2 bg-white dark:bg-gray-800 border border-yellow-400 rounded-md">
                  <code className="text-sm break-all font-mono">
                    {recoveryPassphrase}
                  </code>
                </div>
                <p className="text-xs mt-2 text-yellow-700 dark:text-yellow-400">
                  this passphrase will not be shown again.
                </p>
              </div>
            )}
          </fieldset>

          <fieldset className="flex flex-col gap-4 border border-black dark:border-gray-700 p-4">
            <legend className="text-lg font-semibold px-2 text-black dark:text-white">
              tag management
            </legend>
            <TagManagement />
          </fieldset>

          <fieldset className="flex flex-col gap-4 border border-black dark:border-gray-700 p-4">
            <legend className="text-lg font-semibold px-2 text-black dark:text-white">
              site
            </legend>
            <div>
              <label
                htmlFor="header_text"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                header text
              </label>
              <input
                id="header_text"
                type="text"
                name="header_text"
                value={settings.header_text || ""}
                onChange={handleInputChange}
                placeholder="header text (replaces 'driftlet')"
                className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full"
              />
            </div>
            <div>
              <label
                htmlFor="header_icon_url"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                header icon url
              </label>
              <input
                id="header_icon_url"
                type="text"
                name="header_icon_url"
                value={settings.header_icon_url || ""}
                onChange={handleInputChange}
                placeholder="header icon url"
                className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show_header_icon"
                name="show_header_icon"
                checked={settings.show_header_icon}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <label
                htmlFor="show_header_icon"
                className="text-sm text-black dark:text-white"
              >
                show header icon
              </label>
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-4 border border-black dark:border-gray-700 p-4">
            <legend className="text-lg font-semibold px-2 text-black dark:text-white">
              meta
            </legend>
            <div>
              <label
                htmlFor="favicon_url"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                favicon url
              </label>
              <input
                id="favicon_url"
                type="text"
                name="favicon_url"
                value={settings.favicon_url || ""}
                onChange={handleInputChange}
                placeholder="favicon url"
                className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show_attribution"
                name="show_attribution"
                checked={settings.show_attribution}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <label
                htmlFor="show_attribution"
                className="text-sm text-black dark:text-white"
              >
                show footer attribution
              </label>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={isSubmitting}
            className="p-2 font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? "saving..." : "save settings"}
          </button>
          {error && (
            <p className="text-sm text-center text-red-500 mt-4">{error}</p>
          )}
          {successMessage && (
            <p className="text-sm text-center text-green-500 mt-4">
              {successMessage}
            </p>
          )}
        </form>
      </div>
    </main>
  );
};

export default SettingsForm;
