"use client";

import { UserSettings } from "@/hooks/useSettings";

interface RecoveryPassphraseSectionProps {
  settings: UserSettings;
  currentPassword: string;
  isSubmitting: boolean;
  onGeneratePassphrase: (password: string) => Promise<void>;
  recoveryPassphrase: string;
}

export const RecoveryPassphraseSection: React.FC<
  RecoveryPassphraseSectionProps
> = ({
  settings,
  currentPassword,
  isSubmitting,
  onGeneratePassphrase,
  recoveryPassphrase,
}) => {
  const handleGeneratePassphrase = async () => {
    // Call the parent function to generate the passphrase
    // The parent component will handle setting the recovery phrase
    await onGeneratePassphrase(currentPassword);
  };

  if (recoveryPassphrase) {
    return (
      <div className="p-3 mt-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-500 rounded-md">
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-300">
            your recovery passphrase
          </h4>
        </div>
        <p className="text-xs mb-2 text-yellow-700 dark:text-yellow-400">
          save this passphrase somewhere secure. it can be used to recover your
          account if you forget your password.
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
    );
  }

  return (
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
              {settings.has_recovery_passphrase ? "enabled" : "not set"}
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
          onClick={handleGeneratePassphrase}
          disabled={isSubmitting || !currentPassword}
          className="px-3 py-1.5 text-sm border border-black dark:border-gray-700 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white transition-colors disabled:opacity-50"
        >
          generate new passphrase
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          requires your current password for security.
        </p>
      </div>
    </div>
  );
};
