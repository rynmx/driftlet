export default function LoadingPostPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-4 text-center sm:text-left text-black dark:text-white">
          posts
        </h1>

        {/* Loading skeleton for tag filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-8 w-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Loading skeletons for blog posts */}
        <div className="flex flex-col space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-6">
              <div className="w-3/4 h-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
              <div className="flex items-baseline flex-wrap gap-x-2 mt-1">
                <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="hidden sm:block w-1 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-1" />
                <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              <div className="w-full h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-4" />
              {i < 3 && (
                <hr className="mt-6 border-black dark:border-gray-700" />
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
