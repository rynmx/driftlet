"use client";

import { UserSettings } from "@/hooks/useSettings";
import { FormSection } from "@/components/ui/FormField";
import { PasswordField } from "@/components/ui/PasswordField";
import { RecoveryPassphraseSection } from "./RecoveryPassphraseSection";

interface AccountSectionProps {
  settings: UserSettings;
  username: string;
  setUsername: (username: string) => void;
  currentPassword: string;
  setCurrentPassword: (password: string) => void;
  newPassword: string;
  setNewPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  isSubmitting: boolean;
  onGeneratePassphrase: (password: string) => Promise<void>;
  recoveryPassphrase: string;
}

export const AccountSection: React.FC<AccountSectionProps> = ({
  settings,
  username,
  setUsername,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  isSubmitting,
  onGeneratePassphrase,
  recoveryPassphrase,
}) => {
  return (
    <FormSection title="account">
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

      <PasswordField
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
      />

      <RecoveryPassphraseSection
        settings={settings}
        currentPassword={currentPassword}
        isSubmitting={isSubmitting}
        onGeneratePassphrase={onGeneratePassphrase}
        recoveryPassphrase={recoveryPassphrase}
      />
    </FormSection>
  );
};
