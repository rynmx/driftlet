"use client";

import React from "react";

interface FormFieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  children,
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </label>
      {children}
    </div>
  );
};

interface FormTextInputProps {
  id: string;
  name: string;
  value: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

export const FormTextInput: React.FC<FormTextInputProps> = ({
  id,
  name,
  value = "",
  onChange,
  placeholder = "",
  type = "text",
  required = false,
}) => {
  return (
    <input
      id={id}
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full"
      required={required}
    />
  );
};

interface FormTextAreaProps {
  id: string;
  name: string;
  value: string | null;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  minHeight?: string;
  required?: boolean;
}

export const FormTextArea: React.FC<FormTextAreaProps> = ({
  id,
  name,
  value = "",
  onChange,
  placeholder = "",
  minHeight = "",
  required = false,
}) => {
  return (
    <textarea
      id={id}
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className={`p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full ${minHeight}`}
      required={required}
    />
  );
};

interface FormCheckboxProps {
  id: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  id,
  name,
  checked,
  onChange,
  label,
}) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
      />
      <label htmlFor={id} className="text-sm text-black dark:text-white">
        {label}
      </label>
    </div>
  );
};

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  children,
}) => {
  return (
    <fieldset className="flex flex-col gap-4 border border-black dark:border-gray-700 p-4">
      <legend className="text-lg font-semibold px-2 text-black dark:text-white">
        {title}
      </legend>
      {children}
    </fieldset>
  );
};

interface SubmitButtonProps {
  isSubmitting: boolean;
  label?: string;
  submittingLabel?: string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  isSubmitting,
  label = "save",
  submittingLabel = "saving...",
}) => {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="p-2 font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity disabled:opacity-50"
    >
      {isSubmitting ? submittingLabel : label}
    </button>
  );
};
