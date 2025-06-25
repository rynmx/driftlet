import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full max-w-2xl mx-auto text-center text-xs text-gray-500 dark:text-gray-400 py-8 px-4 sm:px-0">
      <p>
        powered by{' '}
        <Link href="https://github.com/rynmx/driftlet" target="_blank" rel="noopener noreferrer" className="underline">
          driftlet
        </Link>
        , an open source portfolio blogging platform
      </p>
      <p className="mt-2">
        made with ♥ by{' '}
        <Link href="https://github.com/rynmx" target="_blank" rel="noopener noreferrer" className="underline">
          ryana
        </Link>
      </p>
    </footer>
  );
}
