"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string };

type Props = {
  title: string;
  subtitle?: string;
  nav: NavItem[];
};

export function AdminSidebar({ title, subtitle, nav }: Props) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-stone-200 bg-white">
      <div className="border-b border-stone-100 p-6">
        <Link href="/" className="font-display text-xl text-brand-600">
          TableFlow
        </Link>
        <p className="mt-1 text-sm font-medium text-stone-800">{title}</p>
        {subtitle && (
          <p className="text-xs text-stone-500">{subtitle}</p>
        )}
      </div>
      <nav className="admin-scroll flex-1 space-y-1 overflow-y-auto p-4">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm font-medium transition",
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-brand-50 text-brand-700"
                : "text-stone-600 hover:bg-stone-50"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-stone-100 p-4">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-stone-500 hover:bg-stone-50"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
