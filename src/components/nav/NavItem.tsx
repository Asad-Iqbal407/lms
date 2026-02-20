"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      data-active={active ? "true" : "false"}
      className="group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 
        data-[active=true]:bg-zinc-900 data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-zinc-200
        data-[active=false]:text-zinc-500 data-[active=false]:hover:bg-zinc-100 data-[active=false]:hover:text-zinc-900"
    >
      {label}
      {active && (
        <span className="absolute right-2 h-1.5 w-1.5 rounded-full bg-white/40" />
      )}
    </Link>
  );
}

