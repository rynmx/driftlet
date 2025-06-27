"use client";

import { UserSettings } from "@/hooks/useSettings";
import {
  FormField,
  FormTextInput,
  FormTextArea,
  FormSection,
} from "@/components/ui/FormField";

interface ProfileSectionProps {
  settings: UserSettings;
  linksStr: string;
  setLinksStr: (value: string) => void;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  settings,
  linksStr,
  setLinksStr,
  onInputChange,
}) => {
  return (
    <FormSection title="profile">
      <FormField id="name" label="name">
        <FormTextInput
          id="name"
          name="name"
          value={settings.name}
          onChange={onInputChange}
          placeholder="your name"
        />
      </FormField>

      <FormField id="profile_picture_url" label="profile picture url">
        <FormTextInput
          id="profile_picture_url"
          name="profile_picture_url"
          value={settings.profile_picture_url}
          onChange={onInputChange}
          placeholder="profile picture url"
        />
      </FormField>

      <FormField id="bio" label="bio">
        <FormTextArea
          id="bio"
          name="bio"
          value={settings.bio}
          onChange={onInputChange}
          placeholder="short bio (one-liner)"
        />
      </FormField>

      <FormField id="extended_bio" label="extended bio">
        <FormTextArea
          id="extended_bio"
          name="extended_bio"
          value={settings.extended_bio}
          onChange={onInputChange}
          placeholder="extended bio (markdown supported)"
          minHeight="min-h-[200px]"
        />
      </FormField>

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
    </FormSection>
  );
};
