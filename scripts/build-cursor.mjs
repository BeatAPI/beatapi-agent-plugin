/**
 * [INPUT]: Cursor manifest、远程连接、通用远程 Skill 与宿主交互补充
 * [OUTPUT]: 同源安装 Skill 与隔离的 dist/cursor 仓库目录，拒绝过时指引，不修改 OpenAI 包
 * [POS]: Cursor/Grok Bot 远程发行构建，无本地 MCP 运行时与授权执行
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateCursorRemote } from "./validate-cursor.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export function cursorSkill() {
  const source = readFileSync(resolve(root, "submission/REMOTE-SKILL.md"), "utf8").trimEnd();
  const interaction = readFileSync(resolve(root, "cursor/interaction.md"), "utf8").trim();
  return `${source}\n\n${interaction}\n`;
}

export function validateCursorSkill(skill) {
  if (skill !== cursorSkill()) {
    throw new Error("Cursor remote Skill is stale; run npm run cursor:build.");
  }
}

export function buildCursorPackage(output) {
  validateCursorSkill(readFileSync(resolve(root, "cursor/skills/beatapi/SKILL.md"), "utf8"));
  validateCursorRemote(JSON.parse(readFileSync(resolve(root, ".cursor-plugin/plugin.json"), "utf8")),
    JSON.parse(readFileSync(resolve(root, "mcp.json"), "utf8")));
  const files = [".cursor-plugin/plugin.json", "mcp.json", "LICENSE",
    "assets/logo.png", "cursor/skills/beatapi/SKILL.md"];
  // 显式白名单隔离本地运行时、其他宿主和审核资料。
  rmSync(output, { recursive: true, force: true });
  for (const file of files) {
    const target = resolve(output, file);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(resolve(root, file), target);
  }
  cpSync(resolve(root, "cursor/README.md"), resolve(output, "README.md"));
  cpSync(resolve(root, "cursor/OFFICIAL-COMPATIBILITY.md"), resolve(output, "OFFICIAL-COMPATIBILITY.md"));
  const read = (file) => JSON.parse(readFileSync(resolve(output, file), "utf8"));
  validateCursorRemote(read(".cursor-plugin/plugin.json"), read("mcp.json"), output);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const skillPath = resolve(root, "cursor/skills/beatapi/SKILL.md");
  const skill = cursorSkill();
  if (process.argv.includes("--check")) {
    validateCursorSkill(readFileSync(skillPath, "utf8"));
    validateCursorRemote(JSON.parse(readFileSync(resolve(root, ".cursor-plugin/plugin.json"), "utf8")),
      JSON.parse(readFileSync(resolve(root, "mcp.json"), "utf8")));
    process.stdout.write("Cursor/Grok Bot remote sources are consistent; host acceptance remains unverified.\n");
  } else {
    mkdirSync(dirname(skillPath), { recursive: true });
    writeFileSync(skillPath, skill);
    buildCursorPackage(resolve(root, "dist/cursor"));
    process.stdout.write("Built dist/cursor remote plugin candidate; no OAuth registration, deployment or marketplace submission performed.\n");
  }
}
