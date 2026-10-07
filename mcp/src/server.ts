#!/usr/bin/env node
/**
 * [INPUT]: 依赖 MCP SDK、固定工具 profile 与 BeatAPIExecutor 网关适配
 * [OUTPUT]: 提供 createServer 和本地 stdio 入口
 * [POS]: 只注册所选 profile 的工具；不实现 OAuth 或公共 HTTP 服务
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { BeatAPIExecutor, safeError } from "./executor.js";
import { toolsForProfile } from "./profile.js";

export function createServer(
  executor = new BeatAPIExecutor(),
  profile = "local",
): McpServer {
  const tools = toolsForProfile(profile);
  const server = new McpServer({
    name: "beatapi",
    version: "0.4.0",
  });

  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
        outputSchema: z.object({ result: z.unknown() }),
        annotations: tool.annotations,
      },
      async (input) => {
        try {
          const result = await executor.execute(
            tool.name,
            input as Record<string, unknown>,
          );
          const structuredContent = { result };
          return {
            structuredContent,
            content: [
              {
                type: "text",
                text: JSON.stringify(structuredContent, null, 2),
              },
            ],
          };
        } catch (error) {
          const payload = safeError(error);
          return {
            isError: true,
            content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
          };
        }
      },
    );
  }
  return server;
}

async function main(): Promise<void> {
  const profile = process.env.BEATAPI_MCP_PROFILE ?? "local";
  toolsForProfile(profile);
  if (profile === "media-review" && !process.env.BEATAPI_API_KEY?.trim()) {
    throw new Error(
      "The local media-review prototype requires host-configured BEATAPI_API_KEY; CLI credential fallback is not enabled. This is not hosted OAuth.",
    );
  }
  const server = createServer(new BeatAPIExecutor(), profile);
  await server.connect(new StdioServerTransport());
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    process.stderr.write(`${JSON.stringify(safeError(error))}\n`);
    process.exitCode = 1;
  });
}
