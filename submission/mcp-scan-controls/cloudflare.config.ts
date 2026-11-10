/**
 * [INPUT]: 固定 CF 账号、独立诊断路径与显式部署变体
 * [OUTPUT]: 有截止时间的元数据对照服务
 * [POS]: 不修改正式 MCP、DNS、OAuth 或域名验证
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { bindings, defineConfig, triggers } from "cf/config";
export default defineConfig({
  accountId: "8529f0937781e0e44cb0075dc64c46e2",
  worker: {
    name: "beatapi-mcp-scan-controls", entrypoint: "./entry.mjs",
    compatibilityDate: "2026-11-08", workersDev: false, previewUrls: false,
    env: { DIAGNOSTIC_UNTIL: bindings.text("2026-11-09T14:00:00Z"), ACTIVE_CONTROL: bindings.text("full-ui") },
    observability: { enabled: true, headSamplingRate: 1, redactQueryString: true, issues: { enabled: false }, logs: { enabled: true, invocationLogs: false, persist: true }, traces: { enabled: false } },
    triggers: [triggers.fetch({ pattern: "https://api.beatapi.io/mcp/scan-controls/*", zone: "beatapi.io" })],
  },
});
