"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  user: { name?: string | null; email?: string | null; picture?: string | null };
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav className="border-b border-forge-border bg-forge-bg/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-forge-accent/10 border border-forge-accent/30 flex items-center justify-center">
            <span className="text-forge-accent text-sm font-bold">A</span>
          </div>
          <span className="font-semibold text-forge-text">AgentForge</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              pathname === "/"
                ? "text-forge-text bg-forge-card"
                : "text-forge-text-dim hover:text-forge-text"
            }`}
          >
            Agents
          </Link>
          <Link
            href="/dashboard"
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              pathname === "/dashboard"
                ? "text-forge-text bg-forge-card"
                : "text-forge-text-dim hover:text-forge-text"
            }`}
          >
            Dashboard
          </Link>
        </div>

        {/* Auth0 vault indicator + user */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-forge-card border border-forge-border rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-forge-accent animate-pulse-slow" />
            <span className="text-xs font-mono text-forge-text-dim">Token Vault</span>
          </div>
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name || "User"}
              className="w-7 h-7 rounded-full border border-forge-border"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-forge-card border border-forge-border flex items-center justify-center text-xs text-forge-text-dim">
              {(user.name || user.email || "U")[0].toUpperCase()}
            </div>
          )}
          <a
            href="/api/auth/logout"
            className="text-xs text-forge-text-dim hover:text-forge-text transition-colors"
          >
            Sign out
          </a>
        </div>
      </div>
    </nav>
  );
}
