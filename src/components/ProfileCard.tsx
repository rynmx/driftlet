import Image from "next/image";

const ProfileCard = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 py-4 w-full">
      <div className="flex-shrink-0">
        <Image
          src="https://github.com/rynmx.png"
          alt="Ryana May Que"
          width={128}
          height={128}
          className="border-2 border-black dark:border-gray-700"
        />
      </div>
      <div className="flex flex-col text-center sm:text-left">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          ryana may que
        </h1>
        <p className="mt-2 text-black dark:text-gray-400">
          with all the ai stuff going around, i&apos;m going back to basics
        </p>
        <button className="mt-2 text-sm font-bold text-black dark:text-blue-400 hover:underline">
          read more
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
