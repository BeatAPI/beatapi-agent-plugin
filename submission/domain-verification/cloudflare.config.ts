/**
 * [INPUT]: cf/config 的部署定义与单地址 Worker 模块
 * [OUTPUT]: 正确账号下的独立 Worker 和唯一验证路径
 * [POS]: 插件送审基础设施；不替换网关 DNS、业务路由或网站 Worker
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { defineConfig, triggers } from "cf/config";

export default defineConfig({
  accountId: "8529f0937781e0e44cb0075dc64c46e2",
  worker: {
    name: "beatapi-openai-domain-verification",
    compatibilityDate: "2026-11-06",
    entrypoint: "./worker.mjs",
    workersDev: false,
    previewUrls: false,
    triggers: [triggers.fetch({
      pattern: "https://api.beatapi.io/.well-known/openai-apps-challenge",
      zone: "beatapi.io",
    })],
  },
});
