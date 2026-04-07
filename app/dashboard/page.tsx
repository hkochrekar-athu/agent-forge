"use client";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAllAgents } from "@/lib/agentConfig";
import Navbar from "@/components/Navbar";

const agents = getAllAgents();

export default function Dashboard() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-forge-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push("/api/auth/login");
    return null;
  }

  const firstName = user.name?.split(" ")[0] ?? user.nickname ?? "there";

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* Welcome */}
        <div className="animate-fade-in">
          <p className="text-forge-text-dim font-mono text-sm mb-1">Logged in as</p>
          <h1 className="text-3xl font-semibold text-forge-text">
            {firstName} <span className="text-forge-accent">— forge is ready.</span>
          </h1>
          <p className="mt-2 text-forge-text-dim text-sm max-w-xl">
            Your agents are authorized via Auth0 Token Vault. API credentials never touch your code.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 animate-slide-up">
          {[
            { label: "Agents Available", value: agents.length },
            { label: "Auth Provider", value: "Auth0" },
            { label: "Key Storage", value: "Token Vault" },
          ].map((s) => (
            <div key={s.label} className="bg-forge-card border border-forge-border rounded-xl p-5">
              <p className="text-forge-text-dim font-mono text-xs uppercase tracking-widest mb-2">{s.label}</p>
              <p className="text-2xl font-mono font-bold text-forge-accent">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Token Vault banner */}
        <div className="bg-forge-surface border border-forge-accent/20 rounded-xl p-4 flex items-start gap-3">
          <span className="text-lg mt-0.5">🔐</span>
          <div>
            <p className="text-sm font-mono text-forge-text font-semibold">Auth0 Token Vault Active</p>
            <p className="text-xs text-forge-text-dim mt-0.5">
              Anthropic API keys are stored per-user in Auth0 Token Vault and retrieved at runtime.
              Agents are authorized to act on your behalf — no secrets in code.
            </p>
          </div>
        </div>

        {/* Agent grid */}
        <div>
          <h2 className="text-forge-text-dim font-mono text-xs uppercase tracking-widest mb-5">
            Your Agents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="group bg-forge-card border border-forge-border hover:border-forge-accent/40 rounded-xl p-5 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: agent.color + "18", border: `1px solid ${agent.color}30` }}
                  >
                    {agent.icon}
                  </div>
                  <div>
                    <p className="text-forge-text font-semibold text-sm group-hover:text-forge-accent transition-colors">
                      {agent.name}
                    </p>
                    <p className="text-xs font-mono" style={{ color: agent.accentColor }}>
                      {agent.tagline}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent.color }} />
                  <span className="text-xs font-mono text-forge-text-dim">Ready · Click to deploy</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* User info */}
        <div className="border-t border-forge-border pt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user.picture && (
              <img src={user.picture} alt="" className="w-8 h-8 rounded-full border border-forge-border" />
            )}
            <div>
              <p className="text-sm text-forge-text">{user.name}</p>
              <p className="text-xs text-forge-text-dim">{user.email}</p>
            </div>
          </div>
          <a href="/api/auth/logout" className="text-xs text-forge-text-dim hover:text-forge-text transition-colors">
            Sign out
          </a>
        </div>
      </main>
    </div>
  );
}
