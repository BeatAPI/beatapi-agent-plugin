# mcp-diagnostic/
> L2 | 父级: ../AGENTS.md

成员清单
worker.mjs: 精确 MCP 入口的短期透明观察；原请求/响应直接转发，仅输出协议白名单，不缓存、不重试、不修改鉴权。
worker.test.mjs: 请求与流转发不变、错误分类、日志凭证隔离、到期旁路和失败不重试的回归。
cloudflare.config.ts: 固定账号/单路径路由，禁用预览和自动请求日志，仅启用显式白名单日志。
vite.config.mjs: 复用官方 Cloudflare Vite 构建，不依赖服务器部署。
package.json: 独立固定版本工具链与本地回归/部署命令。
package-lock.json: 独立诊断部署依赖锁。
.gitignore: 忽略依赖、构建及 CF 本机状态。
README.md: 临时授权、验证顺序和撤路由要求；不作为公开插件内容。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
