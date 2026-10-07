# test/
> L2 | 父级: ../AGENTS.md

成员清单
plugin.test.ts: 验证跨宿主 manifest、工具 schemas 与凭证安全边界。
mcp-e2e.test.ts: 使用本地 mock 网关验证真实 stdio 协议，不证明生产或付费调用成功。
latest-tools.test.ts: 验证当前能力发现与 Web 接口和同步 Skill 一致。
submission.test.mjs: 验证公共草稿 metadata 与最终 ZIP，防止本地 MCP 和私有绑定泄漏。
review-profile.test.ts: 验证媒体候选工具注册、越界调用拒绝及审核案例工具名一致性。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
