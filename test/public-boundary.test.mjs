/**
 * [INPUT]: 公开仓库路径白名单
 * [OUTPUT]: 内部资料、凭证与深层路径的拒绝回归
 * [POS]: 防止被忽略资料通过强制暂存重新进入源码
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import assert from "node:assert/strict";
import test from "node:test";
import { privatePaths } from "../scripts/check-public-boundary.mjs";

test("public inputs remain allowed without publishing operator evidence", () => {
  assert.deepEqual(privatePaths(["submission/REMOTE-SKILL.md", "submission/mcp.production.json",
    "submission/test-cases.json", ".codex-plugin/plugin.json", "mcp.json", "test/fixtures.json"]), []);
  const privateFiles = ["submission/REVIEW-RUN.md", "submission/artifacts/video.mp4",
    "submission/domain-verification/cloudflare.config.ts", ".env", ".env.production",
    "nested/.env.local", "keys/test.pem", "keys/client.key", "auth.json",
    "nested/credentials.json", ".codex/config.toml", "nested/.codex/auth.json"];
  assert.deepEqual(privatePaths(privateFiles), privateFiles);
});
