# scripts/
> L2 | 父级: ../AGENTS.md

成员清单
build-mcp.mjs: 编译本地 stdio MCP；check 模式验证产物与源码一致。
build-marketplace.mjs: 构建包含本地 MCP 的跨宿主 marketplace，与公开远程包隔离。
build-submission.mjs: 构建远程 MCP + Skill 包；要求固定目录、OAuth 和工具扫描通过，OAuth-only 诊断不能打包。
submission-package.mjs: 远程 manifest、OAuth 配置、公开文件与只读端点预检的共享边界。
remote-preflight.mjs: 官方 SDK 匿名分页扫描、目录完整性与 schema/风险/认证声明一致性验证；报告不覆盖用户授权或付费执行。
remote-capabilities.mjs: 从网关能力契约生成逐 reference 工具，规范 schema 注解并声明最小 OAuth scope，验证绑定和协议层 next；不实现鉴权或计费。
build-remote-catalog.mjs: 匿名全量分页或本地契约输入的构建入口，拒绝缺页、重复和不支持的契约；不调用付费 Run。
contract.mjs: 同步及校验官方 OpenAPI 快照与内容锁。
sync-runtime.mjs: 同步官方 CLI 客户端，维护 vendor 内容锁。
sync-skill.mjs: 同步 canonical 本地 Skill，维护内容锁。
sync-harness.mjs: 将 Harness 共享实现同步到各 npm 包并校验一致性。
validate-cursor.mjs: 校验 Cursor manifest 与环境变量接线。
validate-grok.mjs: 校验 Grok manifest 与本地 MCP 接线。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
