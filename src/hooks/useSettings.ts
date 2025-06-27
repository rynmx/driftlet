import { useState, useEffect } from "react";

export interface UserSettings {
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

interface SettingsState {
  settings: UserSettings | null;
  loading: boolean;
  error: string;
  successMessage: string;
}

interface UpdateSettingsOptions {
  onSuccess?: (data: UserSettings) => void;
  onError?: (error: string) => void;
}

export function useSettings() {
  const [state, setState] = useState<SettingsState>({
    settings: null,
    loading: true,
    error: "",
    successMessage: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setState((prev) => ({ ...prev, settings: data, loading: false }));
      } else {
        setState((prev) => ({
          ...prev,
          error: "Failed to fetch settings",
          loading: false,
        }));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to connect to the server";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
    }
  };

  const updateSettings = async (
    payload: Partial<UserSettings>,
    options?: UpdateSettingsOptions,
  ) => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: "",
      successMessage: "",
    }));

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setState((prev) => ({
          ...prev,
          settings: data,
          loading: false,
          successMessage: "Settings updated successfully!",
        }));

        options?.onSuccess?.(data);
      } else {
        const data = await response.json();
        const errorMessage = data.error || "An unknown error occurred";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));

        options?.onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect to the server";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));

      options?.onError?.(errorMessage);
    }
  };

  const generateRecoveryPassphrase = async (
    currentPassword: string,
    options?: UpdateSettingsOptions,
  ) => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: "",
      successMessage: "",
    }));

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
        setState((prev) => ({
          ...prev,
          settings: {
            ...prev.settings!,
            has_recovery_passphrase: true,
            recovery_passphrase_created_at: new Date().toISOString(),
          },
          loading: false,
          successMessage: "Recovery passphrase generated successfully!",
        }));

        options?.onSuccess?.(data);
      } else {
        const data = await response.json();
        const errorMessage =
          data.error || "Failed to generate recovery passphrase";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));

        options?.onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect to the server";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));

      options?.onError?.(errorMessage);
    }
  };

  return {
    settings: state.settings,
    loading: state.loading,
    error: state.error,
    successMessage: state.successMessage,
    fetchSettings,
    updateSettings,
    generateRecoveryPassphrase,
    setError: (error: string) => setState((prev) => ({ ...prev, error })),
    setSuccessMessage: (successMessage: string) =>
      setState((prev) => ({ ...prev, successMessage })),
    clearMessages: () =>
      setState((prev) => ({ ...prev, error: "", successMessage: "" })),
  };
}
