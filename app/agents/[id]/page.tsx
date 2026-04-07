"use client";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { getAllAgents, getAgent } from "@/lib/agentConfig";
import Navbar from "@/components/Navbar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface LogEntry {
  id: string;
  input: string;
  output: string;
  durationMs: number;
  timestamp: string;
}

export default function AgentPage() {
  const { user, isLoading } = useUser();
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;
  const agent = getAgent(agentId);

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"run" | "logs" | "prompt">("run");
  const [customPrompt, setCustomPrompt] = useState(agent?.systemPrompt || "");
  const [promptSaved, setPromptSaved] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (agent) setCustomPrompt(agent.systemPrompt);
  }, [agent]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

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

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-forge-text-dim mb-4">Agent not found.</p>
          <button onClick={() => router.push("/")} className="text-forge-accent hover:underline text-sm">
            ← Back to agents
          </button>
        </div>
      </div>
    );
  }

  async function handleRun() {
    if (!input.trim() || isRunning) return;
    setIsRunning(true);
    setOutput("");
    const start = Date.now();
    const userInput = input.trim();
    setInput("");

    try {
      const res = await fetch(`/api/agents/${agentId}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: userInput, systemPrompt: customPrompt }),
      });

      if (!res.ok) throw new Error("Agent failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullOutput = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.text) {
                  fullOutput += data.text;
                  setOutput(fullOutput);
                }
              } catch {}
            }
          }
        }
      }

      const durationMs = Date.now() - start;
      const logEntry: LogEntry = {
        id: Math.random().toString(36).slice(2, 10),
        input: userInput,
        output: fullOutput,
        durationMs,
        timestamp: new Date().toISOString(),
      };
      setLogs((prev) => [logEntry, ...prev]);
    } catch (err) {
      setOutput("Error running agent. Check your API key and try again.");
    } finally {
      setIsRunning(false);
    }
  }

  function handleSavePrompt() {
    setPromptSaved(true);
    setTimeout(() => setPromptSaved(false), 2000);
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Back + agent header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="text-forge-text-dim hover:text-forge-text text-sm mb-4 flex items-center gap-1 transition-colors"
          >
            ← All agents
          </button>
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
              style={{
                backgroundColor: agent.color + "18",
                border: `1px solid ${agent.color}30`,
              }}
            >
              {agent.icon}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-forge-text">
                {agent.name}
              </h1>
              <p className="text-sm font-mono" style={{ color: agent.accentColor }}>
                {agent.tagline}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2 bg-forge-card border border-forge-border rounded-full px-3 py-1.5">
              <span
                className="w-2 h-2 rounded-full animate-pulse-slow"
                style={{ backgroundColor: agent.color }}
              />
              <span className="text-xs font-mono text-forge-text-dim">LIVE</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-forge-card border border-forge-border rounded-lg p-1 w-fit">
          {(["run", "logs", "prompt"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? "bg-forge-surface text-forge-text"
                  : "text-forge-text-dim hover:text-forge-text"
              }`}
            >
              {tab === "logs" ? `Logs (${logs.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Run tab */}
        {activeTab === "run" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Input panel */}
            <div className="bg-forge-card border border-forge-border rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-forge-text-dim uppercase tracking-wider font-mono">
                  Input
                </h2>
                <span className="text-xs text-forge-text-dim font-mono">
                  {input.length} chars
                </span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleRun();
                }}
                placeholder={agent.exampleInputs[0]}
                className="flex-1 bg-forge-surface border border-forge-border rounded-lg p-3 text-forge-text text-sm resize-none focus:outline-none focus:border-slate-500 placeholder-forge-text-dim min-h-[220px]"
              />
              {/* Example prompts */}
              <div>
                <p className="text-xs text-forge-text-dim mb-2 font-mono">EXAMPLES</p>
                <div className="flex flex-col gap-2">
                  {agent.exampleInputs.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(ex)}
                      className="text-left text-xs text-forge-text-dim hover:text-forge-text border border-forge-border hover:border-slate-600 rounded-lg px-3 py-2 transition-colors bg-forge-surface"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleRun}
                disabled={!input.trim() || isRunning}
                className="flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed text-slate-900"
                style={{
                  backgroundColor: isRunning ? agent.color + "80" : agent.color,
                }}
              >
                {isRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    Agent thinking...
                  </>
                ) : (
                  <>Deploy Agent ↗</>
                )}
              </button>
              <p className="text-center text-xs text-forge-text-dim">
                ⌘ + Enter to run
              </p>
            </div>

            {/* Output panel */}
            <div className="bg-forge-card border border-forge-border rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-forge-text-dim uppercase tracking-wider font-mono">
                  Output
                </h2>
                {output && (
                  <button
                    onClick={() => navigator.clipboard.writeText(output)}
                    className="text-xs text-forge-text-dim hover:text-forge-text transition-colors"
                  >
                    Copy
                  </button>
                )}
              </div>
              <div
                ref={outputRef}
                className="flex-1 bg-forge-surface border border-forge-border rounded-lg p-4 overflow-y-auto min-h-[360px] max-h-[480px]"
              >
                {!output && !isRunning && (
                  <p className="text-forge-text-dim text-sm text-center mt-16">
                    Agent output will appear here
                  </p>
                )}
                {isRunning && !output && (
                  <div className="flex items-center gap-3 mt-16 justify-center">
                    <div
                      className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: agent.color, borderTopColor: "transparent" }}
                    />
                    <span className="text-forge-text-dim text-sm font-mono">
                      Running {agent.name}...
                    </span>
                  </div>
                )}
                {output && (
                  <div className="agent-output">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {output}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Logs tab */}
        {activeTab === "logs" && (
          <div className="bg-forge-card border border-forge-border rounded-xl overflow-hidden">
            {logs.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-forge-text-dim text-sm">
                  No activity yet. Run the agent to see logs here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-forge-border">
                {logs.map((log) => (
                  <div key={log.id} className="p-5 hover:bg-forge-surface transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-forge-text-dim font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()} ·{" "}
                        {log.durationMs}ms
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-mono"
                        style={{
                          color: agent.accentColor,
                          backgroundColor: agent.color + "18",
                        }}
                      >
                        COMPLETED
                      </span>
                    </div>
                    <p className="text-forge-text text-sm font-medium mb-2">
                      {log.input}
                    </p>
                    <p className="text-forge-text-dim text-xs line-clamp-2">
                      {log.output.slice(0, 200)}
                      {log.output.length > 200 ? "..." : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Prompt customization tab */}
        {activeTab === "prompt" && (
          <div className="bg-forge-card border border-forge-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-forge-text font-semibold mb-1">
                  Customize System Prompt
                </h2>
                <p className="text-forge-text-dim text-sm">
                  Tailor this agent's behavior for your specific use case.
                </p>
              </div>
              <button
                onClick={handleSavePrompt}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-slate-900"
                style={{ backgroundColor: promptSaved ? "#6EE7B7" : agent.color }}
              >
                {promptSaved ? "✓ Saved" : "Save Prompt"}
              </button>
            </div>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full bg-forge-surface border border-forge-border rounded-lg p-4 text-forge-text text-sm font-mono resize-none focus:outline-none focus:border-slate-500 min-h-[400px]"
            />
            <p className="text-xs text-forge-text-dim mt-3">
              This prompt is used for the current session. Changes take effect on the next agent run.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}