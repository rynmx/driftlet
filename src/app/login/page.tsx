import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "login",
};

const LoginPage = () => {
  return <LoginForm />;
};

export default LoginPage;
