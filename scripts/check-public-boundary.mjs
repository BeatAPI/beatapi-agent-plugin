/**
 * [INPUT]: Git 索引中的公开文件路径
 * [OUTPUT]: 拒绝内部审核/部署资料和常见凭证文件的边界校验
 * [POS]: 提交与 CI 共用的公开仓库门槛，不宣称完整秘密或历史扫描
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const publicSubmission = new Set(["AGENTS.md", "SUBMISSION.md", "REMOTE-SKILL.md",
  "remote-tools.json", "test-cases.json", "listing-translations.json",
  "release-notes.md", "mcp.production.json"]);

export function privatePaths(paths) {
  return paths.filter((path) =>
    (path.startsWith("submission/") && !publicSubmission.has(path.slice(11))) ||
    path.split("/").some((part) => part === ".codex" || /^\.env(?:\.|$)/i.test(part)) ||
    /(?:^|\/)(?:credentials|auth)\.json$/i.test(path) ||
    /\.(?:pem|key|p12|pfx)$/i.test(path));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const paths = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
  const rejected = privatePaths(paths);
  if (rejected.length) throw new Error(`Private material must not be tracked:\n${rejected.join("\n")}`);
  process.stdout.write("Public repository path boundary verified; historical contents and unknown secret formats are not covered.\n");
}
