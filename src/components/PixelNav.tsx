"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "HOME" },
  { href: "/blog-extractor", label: "BLOG EXTRACTOR" },
  { href: "/meeting-minutes", label: "MEETING MINUTES" },
  { href: "/knowledge", label: "KNOWLEDGE BASE" },
];

export default function PixelNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-bg-secondary border-b-2 border-border px-6 py-3">
      <div className="max-w-5xl mx-auto flex items-center gap-1">
        <Link href="/" className="text-accent-purple font-bold text-lg mr-6 tracking-wider">
          PIXEL TOOLS
        </Link>
        <div className="flex gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-xs font-medium tracking-wide transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-accent-purple text-white border-2 border-accent-purple"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-card border-2 border-transparent"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
