/**
 * [INPUT]: 各宿主 manifest、本地 MCP 与独立生成的远程 Skill
 * [OUTPUT]: 本地跨宿主 marketplace 归档；Cursor/Grok Bot 仍连接远程服务
 * [POS]: 本地安装归档入口，不作为 OpenAI 或 Cursor 专用公开发行包
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const marketplaceRoot = resolve(dist, "marketplace");
const pluginRoot = resolve(
  marketplaceRoot,
  "plugins/beatapi-agent-plugin",
);
const archive = resolve(dist, "beatapi-agent-plugin-marketplace.zip");
const requiredPaths = [
  ".codex-plugin",
  ".cursor-plugin",
  ".grok-plugin",
  ".mcp.json",
  "mcp.json",
  "assets",
  "contract",
  "generated",
  "skills",
  "cursor",
  "mcp/server.mjs",
  "README.md",
  "SECURITY.md",
  "CHANGELOG.md",
  "LICENSE",
];

rmSync(marketplaceRoot, { recursive: true, force: true });
mkdirSync(pluginRoot, { recursive: true });
for (const relativePath of requiredPaths) {
  const source = resolve(root, relativePath);
  if (!existsSync(source)) throw new Error(`Missing release artifact: ${relativePath}`);
  cpSync(source, resolve(pluginRoot, relativePath), { recursive: true });
}

const marketplacePath = resolve(
  marketplaceRoot,
  ".agents/plugins/marketplace.json",
);
mkdirSync(dirname(marketplacePath), { recursive: true });
writeFileSync(
  marketplacePath,
  `${JSON.stringify(
    {
      name: "beatapi-local",
      interface: { displayName: "BeatAPI" },
      plugins: [
        {
          name: "beatapi-agent-plugin",
          source: {
            source: "local",
            path: "./plugins/beatapi-agent-plugin",
          },
          policy: {
            installation: "AVAILABLE",
            authentication: "ON_USE",
          },
          category: "Creativity",
        },
      ],
    },
    null,
    2,
  )}\n`,
);
rmSync(archive, { force: true });
execFileSync("zip", ["-X", "-q", "-r", archive, "marketplace"], { cwd: dist });
console.log(`Built local BeatAPI agent marketplace: ${marketplaceRoot}`);
console.log(`Built marketplace archive: ${archive}`);
