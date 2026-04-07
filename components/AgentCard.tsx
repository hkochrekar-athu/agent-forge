import Link from "next/link";
import { AgentConfig } from "@/lib/agentConfig";

interface AgentCardProps {
  agent: AgentConfig;
}

export default function AgentCard({ agent }: AgentCardProps) {
  return (
    <Link href={`/agents/${agent.id}`}>
      <div className="group bg-forge-card border border-forge-border rounded-xl p-6 cursor-pointer transition-all duration-200 hover:border-slate-600 hover:bg-forge-surface h-full flex flex-col">
        {/* Icon + badge */}
        <div className="flex items-start justify-between mb-5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: agent.color + "18", border: `1px solid ${agent.color}30` }}
          >
            {agent.icon}
          </div>
          <span
            className="text-xs font-mono px-2 py-1 rounded-full border"
            style={{
              color: agent.accentColor,
              borderColor: agent.color + "40",
              backgroundColor: agent.color + "12",
            }}
          >
            READY
          </span>
        </div>

        {/* Name + tagline */}
        <h2 className="text-forge-text font-semibold text-lg mb-1 group-hover:text-white transition-colors">
          {agent.name}
        </h2>
        <p className="text-xs font-mono mb-3" style={{ color: agent.accentColor }}>
          {agent.tagline}
        </p>
        <p className="text-forge-text-dim text-sm mb-5 leading-relaxed flex-1">
          {agent.description}
        </p>

        {/* Tools */}
        <div className="flex flex-wrap gap-1.5">
          {agent.tools.map((tool) => (
            <span
              key={tool}
              className="bg-forge-surface text-slate-400 text-xs px-2 py-1 rounded-md border border-forge-border"
            >
              {tool}
            </span>
          ))}
        </div>

        {/* Deploy CTA */}
        <div className="mt-5 pt-4 border-t border-forge-border flex items-center justify-between">
          <span className="text-xs text-forge-text-dim">Click to deploy</span>
          <span
            className="text-xs font-medium transition-colors group-hover:text-white"
            style={{ color: agent.accentColor }}
          >
            Deploy →
          </span>
        </div>
      </div>
    </Link>
  );
}
