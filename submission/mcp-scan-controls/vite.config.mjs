/**
 * [INPUT]: 官方 Vite 与 CF 插件
 * [OUTPUT]: 隔离诊断服务构建产物
 * [POS]: 不参与正式插件或网关构建
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
export default defineConfig({ plugins: [cloudflare()] });
