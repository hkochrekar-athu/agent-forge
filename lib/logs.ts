export interface AgentLog {
  id: string;
  agentId: string;
  agentName: string;
  userInput: string;
  output: string;
  durationMs: number;
  tokens: number;
  timestamp: string;
  userId: string;
}

// In-memory store — replace with your DB (Supabase, Postgres, etc.) post-hackathon
const logs: AgentLog[] = [];

export function addLog(log: Omit<AgentLog, "id" | "timestamp">): AgentLog {
  const entry: AgentLog = {
    ...log,
    id: Math.random().toString(36).slice(2, 10),
    timestamp: new Date().toISOString(),
  };
  logs.unshift(entry); // newest first
  if (logs.length > 200) logs.pop(); // cap memory
  return entry;
}

export function getLogsForUser(userId: string): AgentLog[] {
  return logs.filter((l) => l.userId === userId);
}

export function getLogsForAgent(agentId: string, userId: string): AgentLog[] {
  return logs.filter((l) => l.agentId === agentId && l.userId === userId);
}