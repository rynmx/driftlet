"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Prevent body scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <div className="flex md:hidden" ref={menuRef}>
      {/* Hamburger button */}
      <button
        className="p-2 flex flex-col space-y-1.5 justify-center items-center focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <span
          className={`block h-0.5 w-5 bg-black dark:bg-white transition-transform duration-200 ease-in-out ${
            isOpen ? "rotate-45 translate-y-2" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-black dark:bg-white transition-opacity duration-200 ease-in-out ${
            isOpen ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-black dark:bg-white transition-transform duration-200 ease-in-out ${
            isOpen ? "-rotate-45 -translate-y-2" : ""
          }`}
        />
      </button>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 bg-white dark:bg-gray-900 z-40 flex flex-col transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex justify-end p-4">
          <button
            className="p-2 focus:outline-none"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <svg
              className="w-6 h-6 text-black dark:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col items-center justify-center flex-1 space-y-6 text-lg">
          <Link
            href="/"
            className="font-medium text-black dark:text-white hover:underline"
            onClick={() => setIsOpen(false)}
          >
            home
          </Link>
          <Link
            href="/blog"
            className="font-medium text-black dark:text-white hover:underline"
            onClick={() => setIsOpen(false)}
          >
            blog
          </Link>

          {session ? (
            <>
              <Link
                href="/admin/create"
                className="font-medium text-black dark:text-white hover:underline"
                onClick={() => setIsOpen(false)}
              >
                new
              </Link>
              <Link
                href="/settings"
                className="font-medium text-black dark:text-white hover:underline"
                onClick={() => setIsOpen(false)}
              >
                settings
              </Link>
              <button
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                }}
                className="font-medium text-black dark:text-white hover:underline"
              >
                logout
              </button>
            </>
          ) : null}
        </nav>
      </div>
    </div>
  );
}
