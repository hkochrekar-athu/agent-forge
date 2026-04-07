import { getSession } from "@auth0/nextjs-auth0";
import { getAllAgents } from "@/lib/agentConfig";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const agents = getAllAgents().map(({ id, name, tagline, icon, color, accentColor, tools }) => ({
    id, name, tagline, icon, color, accentColor, tools,
  }));
  return NextResponse.json({ agents });
}