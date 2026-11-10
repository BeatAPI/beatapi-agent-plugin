/**
 * [INPUT]: Cloudflare 官方 Vite 插件与 Vite 构建器
 * [OUTPUT]: cf deploy 使用的独立 Worker Build Output
 * [POS]: 域名验证 Worker 的编译接线，不依赖业务前后端构建
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({ plugins: [cloudflare()] });
