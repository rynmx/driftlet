"use client";

import { UserSettings } from "@/hooks/useSettings";
import {
  FormSection,
  FormField,
  FormTextInput,
  FormCheckbox,
} from "@/components/ui/FormField";

interface MetaSectionProps {
  settings: UserSettings;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MetaSection: React.FC<MetaSectionProps> = ({
  settings,
  onInputChange,
  onCheckboxChange,
}) => {
  return (
    <FormSection title="meta">
      <FormField id="favicon_url" label="favicon url">
        <FormTextInput
          id="favicon_url"
          name="favicon_url"
          value={settings.favicon_url}
          onChange={onInputChange}
          placeholder="favicon url"
        />
      </FormField>

      <FormCheckbox
        id="show_attribution"
        name="show_attribution"
        checked={settings.show_attribution}
        onChange={onCheckboxChange}
        label="show footer attribution"
      />
    </FormSection>
  );
};
