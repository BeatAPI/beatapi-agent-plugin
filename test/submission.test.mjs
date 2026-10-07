/**
 * [INPUT]: 依赖 submission 构建器、本地 manifest 与 zip 工具。
 * [OUTPUT]: 验证公共草稿的 metadata、完整文件及本地接线隔离。
 * [POS]: 发布准备回归测试；不替代在线扫描、政策确认或真实工作流测试。
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { createSkillDraftManifest, validateSkillDraftManifest } from "../scripts/submission-package.mjs";

const root = resolve(import.meta.dirname, "..");
const local = JSON.parse(readFileSync(resolve(root, ".codex-plugin/plugin.json"), "utf8"));
test("Skill draft isolates local wiring and retains prerequisites", () => {
  const manifest = createSkillDraftManifest(local, "0.4.0", "Preparation draft.");
  assert.equal(manifest.version, "0.4.0");
  assert.equal(manifest.mcpServers, undefined);
  assert.match(manifest.extensions["com.openai"].interface.longDescription, /BEATAPI_CLI_PATH/);
  assert.match(manifest.extensions["com.openai"].interface.longDescription, /CLI fallback is blocked/);
  assert.ok(manifest.extensions["com.openai"].interface.shortDescription.length <= 30);
});
test("review cases use five positive and three negative drafts, without secrets", () => {
  const cases = JSON.parse(readFileSync(resolve(root, "submission/test-cases.json"), "utf8"));
  assert.equal(cases.positive.length, 5);
  assert.equal(cases.negative.length, 3);
  for (const item of [...cases.positive, ...cases.negative]) {
    assert.match(item.description, /Draft, not run/);
    assert.ok(item.prompt.trim());
  }
  for (const item of cases.positive) {
    assert.ok(item.tools_triggered.trim());
    assert.ok(item.expected_behavior.trim());
  }
  assert.doesNotMatch(JSON.stringify(cases), /test_credentials|reviewer_instructions|sk-[A-Za-z0-9]{20}/);
});
test("public metadata rejects invalid lengths, links and private bindings", () => {
  for (const change of [
    (m) => { m.extensions["com.openai"].interface.shortDescription = "x".repeat(31); },
    (m) => { m.extensions["com.openai"].interface.supportURL = "mailto:support@beatapi.io"; },
    (m) => { m.extensions["com.openai"].apps = "./.app.json"; },
  ]) {
    const manifest = createSkillDraftManifest(local, "0.4.0", "Draft.");
    change(manifest);
    assert.throws(() => validateSkillDraftManifest(manifest));
  }
});
test("built ZIP contains public manifest, skill, icons and license only", () => {
  execFileSync(process.execPath, ["scripts/build-submission.mjs"], { cwd: root });
  const zip = resolve(root, "dist/submission/beatapi-agent-plugin-skills-draft.zip");
  const inventory = execFileSync("unzip", ["-Z1", zip], { encoding: "utf8" });
  for (const path of ["plugin.json", "skills/beatapi-video/SKILL.md", "assets/logo.png", "assets/icon.png", "LICENSE", "README.txt"]) {
    assert.ok(inventory.split("\n").includes(`beatapi-agent-plugin/${path}`), path);
  }
  assert.doesNotMatch(inventory, /\.mcp\.json|mcp\.json|\.app\.json|node_modules|\.codex-plugin/);
  const manifest = JSON.parse(execFileSync("unzip", ["-p", zip, "beatapi-agent-plugin/plugin.json"], { encoding: "utf8" }));
  validateSkillDraftManifest(manifest);
  const readme = execFileSync("unzip", ["-p", zip, "beatapi-agent-plugin/README.txt"], { encoding: "utf8" });
  assert.match(readme, /NOT submission-ready/);
});
