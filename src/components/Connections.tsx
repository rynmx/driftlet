import Link from "next/link";

const connections = [
  { name: "github", url: "https://github.com/rynmx" },
  { name: "blog", url: "/blog" },
  { name: "email", url: "mailto:hello@example.com" },
];

const Connections = () => {
  return (
    <div className="w-full py-8">
      <h2 className="text-lg font-bold text-black dark:text-white mb-2 text-center sm:text-left">
        connections
      </h2>
      <hr className="border-black dark:border-gray-700 mb-4" />
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2">
        {connections.map((link) => (
          <Link
            key={link.name}
            href={link.url}
            target={link.url.startsWith("http") ? "_blank" : "_self"}
            rel={link.url.startsWith("http") ? "noopener noreferrer" : ""}
            className="font-medium text-black dark:text-white hover:underline"
          >
            {link.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Connections;
