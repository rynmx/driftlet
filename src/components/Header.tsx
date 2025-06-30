import Link from "next/link";
import Image from "next/image";
import { getPublicProfile } from "@/lib/user";
import AuthNavLinks from "./AuthNavLinks";
import MobileMenu from "./MobileMenu";

const Header = async () => {
  const profile = await getPublicProfile();

  return (
    <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16 border-b border-black dark:border-gray-700">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            {(profile?.show_header_icon ?? true) && (
              <Image
                src={profile?.header_icon_url || "/logo.svg"}
                alt="header icon"
                width={24}
                height={24}
                className="rounded-full"
              />
            )}
            <span className="text-lg font-bold text-black dark:text-white">
              {profile?.header_text || "driftlet"}
            </span>
          </Link>
        </div>

        {/* Desktop navigation - hidden on mobile */}
        <nav className="hidden md:flex items-center space-x-4">
          <Link
            href="/"
            className="font-medium text-black dark:text-white hover:underline"
          >
            home
          </Link>
          <Link
            href="/post"
            className="font-medium text-black dark:text-white hover:underline"
          >
            posts
          </Link>
          <AuthNavLinks />
        </nav>

        {/* Mobile menu - visible only on mobile */}
        <MobileMenu />
      </div>
    </header>
  );
};

export default Header;
