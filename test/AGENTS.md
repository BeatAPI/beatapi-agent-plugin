# test/
> L2 | 父级: ../AGENTS.md

成员清单
plugin.test.ts: 本地工具 schemas、风险标记、宿主 manifest 与凭证安全回归。
mcp-e2e.test.ts: mock 网关上的真实 stdio 协议与 CLI 桥接；不调用付费服务。
latest-tools.test.ts: 本地工具与同步 Skill 的能力一致性。
submission.test.mjs: OAuth、目录生成及最小 scope、官方 SDK 分页扫描、schema/风险/认证漂移拒绝、next 边界与 ZIP 隔离；mock 不代表线上联调完成。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
