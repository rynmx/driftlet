import type { Metadata } from "next";
import SettingsForm from "@/components/SettingsForm";

export const metadata: Metadata = {
  title: "settings",
};

const SettingsPage = () => {
  return <SettingsForm />;
};

export default SettingsPage;
