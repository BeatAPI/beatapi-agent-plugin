# mcp/src/
> L2 | 父级: ../AGENTS.md

成员清单
server.ts: MCP SDK 注册与 stdio 入口；默认 local 保持完整兼容，media-review 仅供本地候选范围验证。
tools.ts: 固定操作输入 schemas 与风险 annotations；profile 复用而不复制契约。
profile.ts: 八个媒体候选工具白名单；未注册工具无法通过 tools/call 绕过。
executor.ts: 网关调用、CLI 桥接、文件上传和凭证过滤；不承担账户授权服务。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
