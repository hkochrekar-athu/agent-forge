import Anthropic from "@anthropic-ai/sdk";
import { AgentConfig } from "./agentConfig";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AgentRunResult {
  output: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
  durationMs: number;
}

export async function runAgent(
  agentConfig: AgentConfig,
  userInput: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<AgentRunResult> {
  const start = Date.now();

  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory,
    { role: "user", content: userInput },
  ];

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: agentConfig.systemPrompt,
    messages,
  });

  const output =
    response.content[0].type === "text" ? response.content[0].text : "";

  return {
    output,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    model: response.model,
    durationMs: Date.now() - start,
  };
}

export async function* streamAgent(
  agentConfig: AgentConfig,
  userInput: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
): AsyncGenerator<string> {
  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory,
    { role: "user", content: userInput },
  ];

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: agentConfig.systemPrompt,
    messages,
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}
