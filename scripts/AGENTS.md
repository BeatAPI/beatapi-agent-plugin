# scripts/
> L2 | 父级: ../AGENTS.md

成员清单
remote-schema.mjs: 公共结果 envelope 与 Schema 投影/自校验；只规范注解，不改字段约束、调用参数或后台默认值。
build-chatgpt-ui.mjs: 将官方 MCP Apps SDK 和组件源码构建为自包含 HTML；显式导出到网关，check 核对跨仓库产物。
preview-chatgpt-ui.mjs: 本机 MCP Apps 宿主模拟与预览服务，不连接账户、不发起付费调用。
build-mcp.mjs: 编译本地 stdio MCP；check 模式验证产物与源码一致。
build-marketplace.mjs: 构建包含本地 MCP 的跨宿主 marketplace，与公开远程包隔离。
build-submission.mjs: 远程 MCP + Skill 打包入口，要求传入已核验录像 URL；离线检查、展示导出与匿名预检不依赖录像，也不能冒充完整包。
submission-package.mjs: 展示/企业署名/商业声明的唯一构建源；校验素材、案例和 OAuth/工具一致性，公开 ZIP 必须含 HTTPS 无凭据录像链接，但不自动证明可播放或案例通过。
remote-preflight.mjs: 自校验 Schema 注解与结果 envelope；官方 SDK 匿名分页比对工具并读取关联 HTML，验证独立域/MIME/CSP；不执行工具，不冒充宿主审核。
remote-capabilities.mjs: 从网关契约与 x-beatapi-agent-input 确认 schema 编译逐 reference 工具、最小 scope 和结果 UI 元数据；不按模型分支，保留公开范围排除与固定 next，不实现鉴权或计费。
build-remote-catalog.mjs: 匿名全量分页或本地契约编译入口，校验后输出目录；显式 --gateway-dir 同源导出目录及 result_schema.json，不部署。
contract.mjs: 同步及校验官方 OpenAPI 快照与内容锁。
sync-runtime.mjs: 同步官方 CLI 客户端，维护 vendor 内容锁。
sync-skill.mjs: 同步 canonical 本地 Skill，维护内容锁。
sync-harness.mjs: 将 Harness 共享实现同步到各 npm 包并校验一致性。
validate-cursor.mjs: 校验 Cursor manifest 与环境变量接线。
validate-grok.mjs: 校验 Grok manifest 与本地 MCP 接线。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
