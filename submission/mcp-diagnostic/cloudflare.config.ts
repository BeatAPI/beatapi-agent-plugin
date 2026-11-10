/**
 * [INPUT]: 官方 cf 配置、精确 MCP 路由与短期诊断 Worker
 * [OUTPUT]: 固定账号的单入口诊断，不创建 Custom Domain 或修改 DNS
 * [POS]: 临时诊断部署；自动请求日志关闭，避免 URL/凭证进入平台日志
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { bindings, defineConfig, triggers } from "cf/config";

export default defineConfig({
  accountId: "8529f0937781e0e44cb0075dc64c46e2",
  worker: {
    name: "beatapi-mcp-protocol-diagnostic",
    entrypoint: "./worker.mjs",
    compatibilityDate: "2026-11-08",
    workersDev: false,
    previewUrls: false,
    env: { DIAGNOSTIC_UNTIL: bindings.text("2026-11-08T04:30:00Z") },
    observability: { enabled: true, headSamplingRate: 1, redactQueryString: true, issues: { enabled: false }, logs: { enabled: true, invocationLogs: false, persist: true }, traces: { enabled: false } },
    triggers: [triggers.fetch({ pattern: "https://api.beatapi.io/mcp/openai", zone: "beatapi.io" })],
  },
});
