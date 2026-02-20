import Link from "next/link";
import type { Role } from "@/types/auth";
import NavItem from "@/components/nav/NavItem";
import SignOutButton from "@/components/auth/SignOutButton";

export type NavLink = { href: string; label: string };

export default function AppShell({
  title,
  role,
  userName,
  nav,
  children,
}: {
  title: string;
  role: Role;
  userName: string;
  nav: NavLink[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50/50">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3 transition hover:opacity-80">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 shadow-lg shadow-zinc-200">
                <span className="text-xs font-bold text-white">UoG</span>
              </div>
              <span className="text-sm font-bold tracking-tight">{title}</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <div className="text-xs font-bold text-zinc-900">{userName}</div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{role}</div>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-zinc-200 to-zinc-100 ring-1 ring-zinc-200 flex items-center justify-center">
              <span className="text-xs font-bold text-zinc-600">{userName.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl gap-8 px-4 py-8">
        {/* Sidebar Navigation */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-24 space-y-1">
            <div className="mb-4 px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Navigation
            </div>
            {nav.map((item) => (
              <NavItem key={item.href} href={item.href} label={item.label} />
            ))}
            <div className="mt-8 pt-6 border-t border-zinc-100">
              <SignOutButton />
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm ring-1 ring-zinc-100">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
