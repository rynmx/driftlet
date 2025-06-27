"use client";

import { useState } from "react";
import zxcvbn from "zxcvbn";
import { FormField } from "./FormField";

interface PasswordFieldProps {
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
}

interface PasswordStrength {
  score: number;
  feedback: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
}) => {
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: "",
  });

  const handlePasswordChange = (password: string) => {
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
  };

  return (
    <>
      <FormField id="currentPassword" label="current password">
        <input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="required to change password"
          className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full"
        />
      </FormField>

      <FormField id="newPassword" label="new password">
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => handlePasswordChange(e.target.value)}
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
      </FormField>

      <FormField id="confirmPassword" label="confirm new password">
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="confirm new password"
          className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full"
        />
      </FormField>
    </>
  );
};
