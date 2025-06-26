export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import AuthProvider from "@/components/AuthProvider";
import Footer from "@/components/Footer";
import { getPublicProfile } from "@/lib/user";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getPublicProfile();

  const siteName = profile?.header_text || "driftlet";
  const description = profile?.bio || "a minimalist blog and portfolio";

  return {
    title: {
      template: `%s • ${siteName}`,
      default: `${siteName || "driftlet"}`,
    },
    description,
    icons: {
      icon: profile?.favicon_url || "/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getPublicProfile();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Header />
          {children}
          {(profile?.show_attribution ?? true) && <Footer />}
        </AuthProvider>
      </body>
    </html>
  );
}
