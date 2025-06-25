import Link from 'next/link';
import Image from 'next/image';
import { getPublicProfile } from '@/lib/user';
import AuthNavLinks from './AuthNavLinks';

const Header = async () => {
  const profile = await getPublicProfile();

  return (
    <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16 border-b border-black dark:border-gray-700">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            {profile?.header_icon_link && (
              <Image
                src={profile.header_icon_link}
                alt="header icon"
                width={24}
                height={24}
                className="rounded-full"
              />
            )}
            <span className="text-lg font-bold text-black dark:text-white">
              {profile?.header_text || 'driftlet'}
            </span>
          </Link>
        </div>
        <nav className="flex items-center space-x-4">
          <Link href="/" className="font-medium text-black dark:text-white hover:underline">
            home
          </Link>
          <Link href="/blog" className="font-medium text-black dark:text-white hover:underline">
            blog
          </Link>
          <AuthNavLinks />
        </nav>
      </div>
    </header>
  );
};

export default Header;
