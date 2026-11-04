# scripts/
> L2 | 父级: ../AGENTS.md

成员清单
build-mcp.mjs: 编译本地 stdio MCP；check 模式验证产物与源码一致。
build-marketplace.mjs: 构建包含本地 MCP 的跨宿主 marketplace，与公开远程包隔离。
build-submission.mjs: 远程 MCP + Skill 打包入口，要求传入已核验录像 URL；离线检查、展示导出与匿名预检不依赖录像，也不能冒充完整包。
submission-package.mjs: 展示/企业署名/商业声明的唯一构建源；校验素材、案例和 OAuth/工具一致性，公开 ZIP 必须含 HTTPS 无凭据录像链接，但不自动证明可播放或案例通过。
remote-preflight.mjs: 拒绝重新引入公开范围排除项，使用官方 SDK 匿名分页扫描并校验 schema/风险/认证一致性；报告不覆盖用户授权或付费执行。
remote-capabilities.mjs: 从网关契约编译逐 reference 工具与最小 scope，按精确 reference 排除私信唤起、设备/凭证和广告主会话工具，保留公开调研；验证固定绑定和协议 next，不实现鉴权或计费。
build-remote-catalog.mjs: 匿名全量分页或本地契约输入的构建入口，拒绝缺页、重复和不支持的契约；不调用付费 Run。
contract.mjs: 同步及校验官方 OpenAPI 快照与内容锁。
sync-runtime.mjs: 同步官方 CLI 客户端，维护 vendor 内容锁。
sync-skill.mjs: 同步 canonical 本地 Skill，维护内容锁。
sync-harness.mjs: 将 Harness 共享实现同步到各 npm 包并校验一致性。
validate-cursor.mjs: 校验 Cursor manifest 与环境变量接线。
validate-grok.mjs: 校验 Grok manifest 与本地 MCP 接线。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
