/**
 * [INPUT]: 官方 Vite 与 Cloudflare 构建插件
 * [OUTPUT]: 独立诊断 Worker 的部署产物
 * [POS]: 不与网关或公开 ZIP 构建混用
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
export default defineConfig({ plugins: [cloudflare()] });
