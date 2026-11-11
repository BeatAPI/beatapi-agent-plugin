/**
 * [INPUT]: Cursor manifest、远程 MCP 配置与文件树
 * [OUTPUT]: 可复用的远程接线验证及 CLI 校验，不发起 OAuth 或业务请求
 * [POS]: Cursor/Grok Bot 发布边界，拒绝本地后备、秘密与 ChatGPT 客户端混用
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function validateCursorRemote(manifest, mcp, directory = root) {
  const packageManifest = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
  if (!/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(manifest.name) ||
      manifest.name !== packageManifest.name || manifest.version !== packageManifest.version) {
    throw new Error("Cursor plugin name/version must match the package manifest.");
  }
  for (const field of ["logo", "skills", "mcpServers"]) {
    const path = manifest[field];
    if (typeof path !== "string" || path.startsWith("/") || path.includes("..") ||
        !existsSync(resolve(directory, path))) {
      throw new Error(`Cursor manifest ${field} must reference an existing safe relative path.`);
    }
  }
  if (!manifest.description || manifest.skills !== "./cursor/skills/" ||
      manifest.mcpServers !== "./mcp.json" || manifest.variables !== undefined) {
    throw new Error("Cursor remote plugin must use remote skills and no local credential variables.");
  }
  const server = mcp.mcpServers?.beatapi;
  if (Object.keys(mcp).join() !== "mcpServers" ||
      Object.keys(mcp.mcpServers).join() !== "beatapi" || !server ||
      Object.keys(server).sort().join() !== "auth,url" ||
      server.url !== "https://api.beatapi.io/mcp/openai" ||
      Object.keys(server.auth ?? {}).sort().join() !== "CLIENT_ID,scopes" ||
      server.auth.CLIENT_ID !== "beatapi-cursor") {
    throw new Error("Cursor MCP must use the shared HTTPS service and dedicated public OAuth client only.");
  }
  const scopes = server.auth.scopes;
  if (!Array.isArray(scopes) || scopes.length === 0 ||
      new Set(scopes).size !== scopes.length ||
      scopes.some((scope) => typeof scope !== "string" || !/^mcp:[a-z]+:(read|create|run)$/.test(scope))) {
    throw new Error("Cursor OAuth scopes must be explicit, unique BeatAPI capability scopes.");
  }
  return manifest;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const manifest = JSON.parse(readFileSync(resolve(root, ".cursor-plugin/plugin.json"), "utf8"));
  const mcp = JSON.parse(readFileSync(resolve(root, "mcp.json"), "utf8"));
  validateCursorRemote(manifest, mcp);
  process.stdout.write(`Validated remote Cursor/Grok Bot config ${manifest.name}@${manifest.version}; OAuth registration and host tests are not verified.\n`);
}
