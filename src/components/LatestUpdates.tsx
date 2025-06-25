const LatestUpdates = () => {
  return (
    <div className="w-full py-8">
      <h2 className="text-lg font-bold text-black dark:text-white mb-2 text-center sm:text-left">
        latest updates
      </h2>
      <hr className="border-black dark:border-gray-700 mb-4" />
      <div className="space-y-4">
        {/* Placeholder for blog posts */}
        <div>
          <h3 className="font-bold text-black dark:text-white">
            my first blog post
          </h3>
          <p className="text-sm text-black dark:text-gray-400 mt-1">
            October 26, 2023
          </p>
        </div>
        <div>
          <h3 className="font-bold text-black dark:text-white">
            building this portfolio
          </h3>
          <p className="text-sm text-black dark:text-gray-400 mt-1">
            October 27, 2023
          </p>
        </div>
      </div>
    </div>
  );
};

export default LatestUpdates;
