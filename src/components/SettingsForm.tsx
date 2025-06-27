"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TagManagement from "./TagManagement";
import { useSettings, UserSettings } from "@/hooks/useSettings";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { AccountSection } from "@/components/settings/AccountSection";
import { SiteSection } from "@/components/settings/SiteSection";
import { MetaSection } from "@/components/settings/MetaSection";
import { SubmitButton } from "@/components/ui/FormField";
import { FormSection } from "@/components/ui/FormField";

const SettingsForm = () => {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login");
    },
  });

  // Form-specific state
  const [username, setUsername] = useState("");
  const [linksStr, setLinksStr] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryPassphrase, setRecoveryPassphrase] = useState("");

  // Settings hook
  const {
    settings,
    loading,
    error,
    successMessage,
    updateSettings,
    generateRecoveryPassphrase,
    setError,
  } = useSettings();

  // Initialize form values from settings once loaded
  if (settings && username === "" && linksStr === "") {
    setUsername(settings.username || "");
    setLinksStr(JSON.stringify(settings.links || {}, null, 2));
  }

  // Create a local settings state to track changes before submission
  const [localSettings, setLocalSettings] = useState<Partial<UserSettings>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setLocalSettings((prev: Partial<UserSettings>) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setLocalSettings((prev: Partial<UserSettings>) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleGeneratePassphrase = async (password: string) => {
    return generateRecoveryPassphrase(password, {
      onSuccess: (data) => {
        if (data.recovery_passphrase_plain) {
          setRecoveryPassphrase(data.recovery_passphrase_plain);
        } else {
          console.error("API response missing recovery_passphrase_plain");
        }
      },
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setRecoveryPassphrase(""); // Clear any previous passphrase

    let parsedLinks;
    try {
      parsedLinks = JSON.parse(linksStr);
    } catch {
      setError("Links field contains invalid JSON");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    const payload = {
      ...settings,
      ...localSettings, // Include all local changes
      links: parsedLinks,
      username,
      ...(newPassword && { currentPassword, newPassword }),
    };

    updateSettings(payload, {
      onSuccess: (data) => {
        if (data.recovery_passphrase_plain) {
          setRecoveryPassphrase(data.recovery_passphrase_plain);
        }
        // Reset local changes after successful update
        setLocalSettings({});
      },
    });
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
          <ProfileSection
            settings={{ ...settings, ...localSettings }}
            linksStr={linksStr}
            setLinksStr={setLinksStr}
            onInputChange={handleInputChange}
          />

          <AccountSection
            settings={{ ...settings, ...localSettings }}
            username={username}
            setUsername={setUsername}
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            isSubmitting={loading}
            onGeneratePassphrase={handleGeneratePassphrase}
            recoveryPassphrase={recoveryPassphrase}
          />

          <FormSection title="tag management">
            <TagManagement />
          </FormSection>

          <SiteSection
            settings={{ ...settings, ...localSettings }}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
          />

          <MetaSection
            settings={{ ...settings, ...localSettings }}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
          />

          <SubmitButton
            isSubmitting={loading}
            label="save settings"
            submittingLabel="saving..."
          />

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
