/**
 * [INPUT]: 远程发布源、固定工具目录与操作者提供的真实 OAuth MCP 配置
 * [OUTPUT]: 离线检查、带状态报告的匿名预检或经过工具一致性验证的远程 ZIP
 * [POS]: 公开发布命令入口，不再用依赖 CLI 的 Skill-only 包冒充远程集成
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { buildRemotePackage, checkRemoteSource, probeRemoteOAuth, probeRemoteRelease } from "./submission-package.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
let reportPath;
function writeProbeReport(report) {
  if (!reportPath) return;
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, JSON.stringify({ checkedAt: new Date().toISOString(), ...report }, null, 2) + "\n");
}
try {
  const { values } = parseArgs({ options: {
    check: { type: "boolean" }, probe: { type: "boolean" }, "mcp-config": { type: "string" },
    catalog: { type: "string" }, "oauth-only": { type: "boolean" },
    report: { type: "string" },
  } });
  if (values.report && !values.probe) throw new Error("--report requires --probe.");
  reportPath = values.report ? resolve(values.report) : undefined;
  if (values.check) {
    if (values.probe || values["mcp-config"] || values.catalog || values["oauth-only"]) throw new Error("Use --check alone; it validates source without claiming endpoint readiness.");
    checkRemoteSource(root);
    console.log("Remote package source checked. OAuth connection, tool review and publication remain separate checks; no ZIP emitted.");
  } else {
    if (!values["mcp-config"]) throw new Error("Provide --mcp-config <path-to-actual-remote-mcp.json> after the gateway OAuth endpoint is deployed. No default endpoint or Skill-only fallback will be invented.");
    const config = JSON.parse(readFileSync(resolve(values["mcp-config"]), "utf8"));
    if (values["oauth-only"] && !values.probe) throw new Error("--oauth-only is diagnostic and requires --probe; it cannot build a public ZIP.");
    if (values["oauth-only"]) {
      const report = { status: "oauth-metadata-only", oauth: await probeRemoteOAuth(config),
        notVerified: ["remote tool catalog", "user authorization and business workflows", "Portal review"] };
      writeProbeReport(report);
      console.log(JSON.stringify(report));
      console.log("OAuth metadata only; no tool comparison or release-readiness claim.");
    } else {
      if (!values.catalog) throw new Error("Provide --catalog <generated-remote-catalog.json>; OAuth metadata alone cannot verify the published tools.");
      const catalog = JSON.parse(readFileSync(resolve(values.catalog), "utf8"));
      if (values.probe) {
        const report = { status: "anonymous-metadata-matched", ...await probeRemoteRelease(config, catalog) };
        writeProbeReport(report);
        console.log(JSON.stringify(report));
        console.log("Anonymous tool metadata matches; user OAuth and paid workflows remain unverified.");
      } else {
        const archive = await buildRemotePackage(root, resolve(root, "dist/submission"), config, fetch, catalog);
        console.log(`Built remote MCP + Skill archive: ${archive}`);
        console.log("Not proof of submission readiness: run real user OAuth/tool cases and complete review materials before uploading.");
      }
    }
  }
} catch (error) {
  writeProbeReport({ status: "blocked", reason: error instanceof Error ? error.message : String(error) });
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
