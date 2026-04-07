import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import Anthropic from "@anthropic-ai/sdk";
import { getAgent } from "@/lib/agentConfig";
import { addLog } from "@/lib/logs";

// ─── Auth0 Token Vault ────────────────────────────────────────────────────────

async function getManagementToken(domain: string, clientId: string, clientSecret: string) {
  try {
    const res = await fetch(`https://${domain}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        audience: `https://${domain}/api/v2/`,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token ?? null;
  } catch { return null; }
}

async function getKeyFromTokenVault(userId: string, domain: string, mgmtToken: string) {
  try {
    const res = await fetch(
      `https://${domain}/api/v2/users/${encodeURIComponent(userId)}/token-vault/connections/anthropic/access-token`,
      { headers: { Authorization: `Bearer ${mgmtToken}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.access_token ?? null;
  } catch { return null; }
}

// ─── POST /api/agents/[id]/deploy ─────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Auth check
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate agent
  const agent = getAgent(params.id);
  if (!agent) {
    return NextResponse.json({ error: `Agent "${params.id}" not found` }, { status: 404 });
  }

  // 3. Parse body — UI sends { input, systemPrompt }
  const { input, systemPrompt } = await req.json();
  if (!input?.trim()) {
    return NextResponse.json({ error: "Input is required" }, { status: 400 });
  }

  // 4. Resolve API key — Token Vault first, env fallback
  let anthropicKey: string | null = null;
  let keySource = "env";

  const domain = process.env.AUTH0_DOMAIN!;
  const mgmtClientId = process.env.AUTH0_MGMT_CLIENT_ID;
  const mgmtClientSecret = process.env.AUTH0_MGMT_CLIENT_SECRET;

  if (mgmtClientId && mgmtClientSecret) {
    const mgmtToken = await getManagementToken(domain, mgmtClientId, mgmtClientSecret);
    if (mgmtToken) {
      anthropicKey = await getKeyFromTokenVault(session.user.sub, domain, mgmtToken);
      if (anthropicKey) keySource = "auth0-token-vault";
    }
  }

  if (!anthropicKey) anthropicKey = process.env.ANTHROPIC_API_KEY ?? null;
  if (!anthropicKey) {
    return NextResponse.json({ error: "No Anthropic API key available" }, { status: 500 });
  }

  // 5. Stream response via SSE
  const effectiveSystemPrompt = systemPrompt || agent.systemPrompt;
  const anthropic = new Anthropic({ apiKey: anthropicKey });
  const start = Date.now();
  let fullOutput = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = await anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 2048,
          system: effectiveSystemPrompt,
          messages: [{ role: "user", content: input }],
        });

        for await (const event of claudeStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const chunk = event.delta.text;
            fullOutput += chunk;
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
            );
          }
        }

        // Log the completed run
        addLog({
          agentId: agent.id,
          agentName: agent.name,
          userInput: input,
          output: fullOutput,
          durationMs: Date.now() - start,
          tokens: 0,
          userId: session.user.sub,
        });

        // Send metadata so demo video can show Token Vault source
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({ done: true, keySource, durationMs: Date.now() - start })}\n\n`
          )
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Agent error";
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
