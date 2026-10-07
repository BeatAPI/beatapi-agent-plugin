/**
 * [INPUT]: 依赖本地 manifest、同步 Skill、品牌 assets 与提交准备文档。
 * [OUTPUT]: 独立 portable Skill 草稿 ZIP；不宣称公开审核就绪。
 * [POS]: 与本地 marketplace 分离的发布准备入口，禁止复制本地 MCP 配置。
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createSkillDraftManifest } from "./submission-package.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist/submission");
const stage = resolve(dist, "beatapi-agent-plugin");
const zip = resolve(dist, "beatapi-agent-plugin-skills-draft.zip");
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
mkdirSync(stage, { recursive: true });
for (const path of ["skills", "LICENSE"]) {
  cpSync(resolve(root, path), resolve(stage, path), { recursive: true });
}
mkdirSync(resolve(stage, "assets"));
for (const name of ["logo.png", "logo-dark.png", "icon.png"]) {
  cpSync(resolve(root, "assets", name), resolve(stage, "assets", name));
}
const local = JSON.parse(readFileSync(resolve(root, ".codex-plugin/plugin.json"), "utf8"));
const { version } = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const releaseNotes = readFileSync(resolve(root, "submission/release-notes.md"), "utf8");
writeFileSync(resolve(stage, "plugin.json"), `${JSON.stringify(createSkillDraftManifest(local, version, releaseNotes), null, 2)}\n`);
writeFileSync(
  resolve(stage, "README.txt"),
  [
    "BeatAPI Skills-only preparation draft - NOT submission-ready",
    "",
    "Submission type: Skills only",
    "Artifact: beatapi-agent-plugin-skills-draft.zip",
    "Portal: https://platform.openai.com/plugins",
    "The cross-host agent plugin also includes a local stdio MCP server. Public MCP review",
    "requires a separately deployed HTTPS MCP server and is intentionally not",
    "claimed by this Skills-only package.",
    "",
    "Current prerequisite: compatible BeatAPI MCP tools supplied by the host.",
    "The synchronized Skill references beatapi@0.4.0, unavailable on public npm",
    "when checked on 2026-10-07. CLI fallback is blocked until upstream releases agree.",
    "Future CLI setup needs authentication outside chat and absolute BEATAPI_CLI_PATH.",
    "Public review blockers: local execution/persistent credentials, verified publisher,",
    "country availability, policy coverage and source authorization must be resolved.",
    "A future remote-MCP release requires a different validated package and review evidence.",
    "",
  ].join("\n"),
);
if (!existsSync(stage))
  throw new Error("Submission staging directory is missing.");
execFileSync("zip", ["-X", "-q", "-r", zip, "beatapi-agent-plugin"], { cwd: dist });
console.log(`Built Skills-only preparation draft (NOT submission-ready): ${zip}`);
