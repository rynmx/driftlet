import Image from "next/image";
import Link from "next/link";
import { PublicProfile } from "@/lib/user";
import { FiArrowUpRight } from "react-icons/fi";

export default function AuthorProfileCard({
  profile,
}: {
  profile: PublicProfile;
}) {
  if (!profile || !profile.name) {
    return null;
  }

  return (
    <div className="mt-12 mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 className="tracking-wide text-gray-500 text-xs dark:text-gray-400 mb-4">
        about the author:
      </h3>
      <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        {profile.profile_picture_url && (
          <Image
            src={profile.profile_picture_url}
            alt={profile.name || "profile picture"}
            width={80}
            height={80}
            className="rounded-full object-cover w-[80px] h-[80px]"
          />
        )}
        <div>
          <h3 className="text-xl font-semibold text-black dark:text-white">
            {profile.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {profile.bio}
          </p>

          {profile.links && Object.keys(profile.links).length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
              {Object.entries(profile.links).map(([key, value]) => (
                <Link
                  key={key}
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-1 text-sm text-black dark:text-white hover:underline"
                >
                  {key}
                  <FiArrowUpRight
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    size=".75em"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
