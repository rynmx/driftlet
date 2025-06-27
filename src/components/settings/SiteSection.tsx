"use client";

import { UserSettings } from "@/hooks/useSettings";
import {
  FormSection,
  FormField,
  FormTextInput,
  FormCheckbox,
} from "@/components/ui/FormField";

interface SiteSectionProps {
  settings: UserSettings;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SiteSection: React.FC<SiteSectionProps> = ({
  settings,
  onInputChange,
  onCheckboxChange,
}) => {
  return (
    <FormSection title="site">
      <FormField id="header_text" label="header text">
        <FormTextInput
          id="header_text"
          name="header_text"
          value={settings.header_text}
          onChange={onInputChange}
          placeholder="header text (replaces 'driftlet')"
        />
      </FormField>

      <FormField id="header_icon_url" label="header icon url">
        <FormTextInput
          id="header_icon_url"
          name="header_icon_url"
          value={settings.header_icon_url}
          onChange={onInputChange}
          placeholder="header icon url"
        />
      </FormField>

      <FormCheckbox
        id="show_header_icon"
        name="show_header_icon"
        checked={settings.show_header_icon}
        onChange={onCheckboxChange}
        label="show header icon"
      />
    </FormSection>
  );
};
