"use client";
import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import { getAllAgents } from "@/lib/agentConfig";
import AgentCard from "@/components/AgentCard";
import Navbar from "@/components/Navbar";

const agents = getAllAgents();

export default function Home() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-forge-accent border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-sm">Initializing...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-14 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-forge-card border border-forge-border rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-forge-accent animate-pulse-slow" />
            <span className="text-xs font-mono text-forge-accent tracking-wider">
              AGENT REGISTRY
            </span>
          </div>
          <h1 className="text-4xl font-semibold text-forge-text mb-3 leading-tight">
            Choose your agent
          </h1>
          <p className="text-forge-text-dim text-lg max-w-xl">
            Deploy a specialized AI agent to automate your business workflows.
            Each agent is purpose-built and powered by Claude.
          </p>
        </div>

        {/* Agent grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-slide-up">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>

        {/* Dashboard link */}
        <div className="mt-12 pt-8 border-t border-forge-border flex items-center justify-between">
          <p className="text-forge-text-dim text-sm">
            View deployed agents and activity logs
          </p>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-forge-accent hover:text-white transition-colors font-medium"
          >
            Open Dashboard →
          </Link>
        </div>
      </main>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-24">
        <div className="inline-flex items-center gap-2 bg-forge-card border border-forge-border rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-forge-accent animate-pulse-slow" />
          <span className="text-xs font-mono text-forge-accent tracking-wider">
            POWERED BY CLAUDE
          </span>
        </div>

        <h1 className="text-6xl font-semibold text-forge-text mb-6 leading-[1.1] max-w-3xl">
          AI agents that
          <br />
          <span className="text-forge-accent">work for your agency</span>
        </h1>
        <p className="text-forge-text-dim text-xl max-w-xl mb-12 leading-relaxed">
          AgentForge gives you production-ready AI agents for sales, project
          management, and analytics — deployed in seconds.
        </p>

        <div className="flex gap-4">
          <a
            href="/api/auth/login"
            className="px-8 py-3.5 bg-forge-accent text-slate-900 font-semibold rounded-lg hover:bg-white transition-colors text-sm"
          >
            Get Started Free
          </a>
          <a
            href="#agents"
            className="px-8 py-3.5 border border-forge-border text-forge-text-dim hover:text-forge-text hover:border-slate-500 rounded-lg transition-colors text-sm"
          >
            See the Agents
          </a>
        </div>
      </div>

      {/* Agent preview */}
      <div id="agents" className="max-w-6xl mx-auto w-full px-6 pb-24">
        <p className="text-center text-forge-text-dim text-sm font-mono tracking-wider uppercase mb-10">
          Three agents. Infinite tasks.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-forge-card border border-forge-border rounded-xl p-6 opacity-75"
            >
              <div className="text-3xl mb-4">{agent.icon}</div>
              <h3 className="text-forge-text font-semibold mb-1">
                {agent.name}
              </h3>
              <p className="text-forge-text-dim text-sm mb-4">
                {agent.tagline}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {agent.tools.map((t) => (
                  <span
                    key={t}
                    className="bg-forge-surface text-slate-400 text-xs px-2 py-1 rounded-md border border-forge-border"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-forge-border py-6 px-6">
        <p className="text-center text-forge-text-dim text-xs">
          Built by{" "}
          <span className="text-forge-text">Harshada Solutions</span> · Powered
          by Claude ·{" "}
          <a
            href="/api/auth/login"
            className="text-forge-accent hover:underline"
          >
            Sign in
          </a>
        </p>
      </footer>
    </div>
  );
}