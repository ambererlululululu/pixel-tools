"use client";

import Link from "next/link";

interface ToolCardProps {
  href: string;
  icon: string;
  title: string;
  description: string;
  accentColor: string;
  status?: string;
}

export default function ToolCard({
  href,
  icon,
  title,
  description,
  accentColor,
  status = "READY",
}: ToolCardProps) {
  return (
    <Link href={href} className="block">
      <div className="pixel-card p-6 h-full group">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 flex items-center justify-center text-2xl border-2 shrink-0"
            style={{ borderColor: accentColor, color: accentColor }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-text-primary group-hover:text-accent-purple transition-colors">
                {title}
              </h3>
              <span
                className="pixel-badge text-[10px]"
                style={{ borderColor: accentColor, color: accentColor }}
              >
                {status}
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-border">
          <span className="text-xs text-text-muted group-hover:text-accent-purple transition-colors tracking-wide">
            {">"} LAUNCH TOOL
          </span>
        </div>
      </div>
    </Link>
  );
}
