import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "login",
};

const LoginPage = () => {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
};

export default LoginPage;
