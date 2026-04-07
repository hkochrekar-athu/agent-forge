# AgentForge 🔥

> **Deploy AI agents securely — authorized to act on your behalf.**

Built for the **Auth0 "Authorized to Act" Hackathon** by [Harshada Solutions](https://harshadasolutions.com), Goa, India.

---

## What is AgentForge?

AgentForge is an AI agent deployment platform that lets authenticated users spin up specialized AI agents (Research, Writer, Code, Analyst) and run tasks — without ever exposing API credentials in code.

**The key differentiator:** Agent authorization flows through **Auth0 Token Vault**. API keys are stored securely per-user and retrieved at runtime, so agents are truly *authorized to act* on behalf of each individual user.

---

## How It Uses Auth0

### 🔐 Authentication
- Login / logout via Auth0 Universal Login
- Session management with `@auth0/nextjs-auth0`
- Protected routes via `middleware.ts`

### 🗝️ Token Vault (Core Hackathon Feature)
- Anthropic API keys are stored in **Auth0 Token Vault** per user
- At agent deployment time, the server retrieves the user's vault token via the Auth0 Management API
- **No API key is ever hardcoded** — the vault is the source of truth
- Falls back to a shared env key only if vault is not configured

```
User logs in → Deploys agent → Server fetches key from Auth0 Token Vault
→ Claude executes task → Result returned to authenticated user
```

---

## Available Agents

| Agent | Purpose |
|---|---|
| 🔍 Research Agent | Deep research with structured reports |
| ✍️ Writer Agent | Copy, blogs, emails, long-form content |
| ⚙️ Code Agent | Write, review, and debug code |
| 📊 Analyst Agent | Data analysis and business insights |

---

## Tech Stack

- **Next.js 14** (App Router)
- **Auth0** (`@auth0/nextjs-auth0`) + Token Vault
- **Claude** via `@anthropic-ai/sdk` (claude-opus-4-5)
- **Tailwind CSS** with custom `forge` design system
- **Vercel** for deployment

---

## Getting Started

```bash
git clone https://github.com/YOUR_USERNAME/agentforge
cd agentforge
npm install
cp .env.example .env.local
# Fill in your Auth0 + Anthropic credentials
npm run dev
```

### Environment Variables

See `.env.example` for all required variables:
- `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`
- `AUTH0_DOMAIN`, `AUTH0_MGMT_CLIENT_ID`, `AUTH0_MGMT_CLIENT_SECRET` (for Token Vault)
- `ANTHROPIC_API_KEY` (fallback)

### Auth0 Setup

1. Create an application in Auth0 (Regular Web App)
2. Set callback URL: `https://your-domain.vercel.app/api/auth/callback`
3. Set logout URL: `https://your-domain.vercel.app`
4. Create a Machine-to-Machine app with Management API permissions: `read:users`, `update:users`
5. Configure Token Vault connection named `anthropic` (or use env fallback)

---

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push to GitHub
2. Import to Vercel
3. Add all environment variables from `.env.example`
4. Update `AUTH0_BASE_URL` to your Vercel URL
5. Update Auth0 callback/logout URLs to match Vercel URL

---

## Project Structure

```
agentforge/
├── app/
│   ├── api/
│   │   ├── auth/[auth0]/route.ts     # Auth0 handler
│   │   └── agents/[id]/deploy/       # Agent execution + Token Vault
│   │       └── route.ts
│   ├── dashboard/page.tsx            # Authenticated agent hub
│   ├── agents/[id]/page.tsx          # Individual agent UI
│   ├── layout.tsx
│   └── page.tsx                      # Landing / login
├── middleware.ts                      # Auth0 route protection
├── .env.example
└── README.md
```

---

## Built by

**Harshada Kochrekar** — Harshada Solutions, Goa, India  
*"Goa to the World"* 🌊

---

## License

MIT
