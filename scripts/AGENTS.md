# scripts/
> L2 | 父级: ../AGENTS.md

成员清单
check-public-boundary.mjs: 检查 Git 索引，拒绝内部审核/部署资料与常见凭证文件，不作为完整秘密扫描。
remote-presentation.mjs: 按 reference 核实用途与技术名；区分 Bilibili 创作者榜/期数及 Douyin 增粉率/点赞率/搜索热度/话题热度，保留各自分页与结构标签；沿用 Instagram/星图边界，不改变参数或承诺私有访问。
remote-metadata.mjs: 固定描述符的展示/紧凑/共享指引投影；公开范围复用统一排除表，仅删除排除工具与读取引用，不重建其他枚举或参数。
remote-schema.mjs: 公共结果 envelope 与 Schema 投影/自校验；只规范注解，不改字段约束、调用参数或后台默认值。
build-chatgpt-ui.mjs: 将官方 MCP Apps SDK 和组件源码构建为自包含 HTML；显式导出到网关，check 核对跨仓库产物。
preview-chatgpt-ui.mjs: 本机 MCP Apps 宿主模拟与预览服务，不连接账户、不发起付费调用。
build-mcp.mjs: 编译本地 stdio MCP；check 模式验证产物与源码一致。
build-marketplace.mjs: 构建跨宿主本地安装归档，包含 Cursor 远程 Skill；不作为 Cursor 专用发行或 OpenAI 远程包。
build-cursor.mjs: 从通用远程 Skill 与宿主交互补充生成 Cursor/Grok Bot 指引和白名单 dist/cursor；构建/check 均拒绝过时指引，附官方兼容性证据，不部署或授权。
build-submission.mjs: 远程 MCP + Skill 打包入口，要求传入已核验录像 URL；离线检查、展示导出与匿名预检不依赖录像，也不能冒充完整包。
submission-package.mjs: 展示/企业署名/商业声明的唯一构建源；Data & Analytics 类目对应市场内容研究，不在公开描述做价格宣称，费用披露保留在 Skill/审核信息；校验素材、案例、录像链接与线上契约，不冒充案例通过。
remote-preflight.mjs: 公开范围及 Schema/envelope 校验，拒绝通过结果/任务枚举重新引入策略排除引用；其他历史枚举保留，SDK 匿名分页比对共享指引/UI，不执行工具。
remote-capabilities.mjs: 从网关契约和统一展示词典编译逐 reference 工具、最小 scope 与结果 UI；保留公开范围和固定 next，不实现鉴权或计费。
build-remote-catalog.mjs: 匿名全量分页或本地契约编译；--compact 精简注解，--shared-instructions 集中通用执行指引；均显式启用，--gateway-dir 同源导出且不部署。
contract.mjs: 同步及校验官方 OpenAPI 快照与内容锁。
sync-runtime.mjs: 同步官方 CLI 客户端，维护 vendor 内容锁。
sync-skill.mjs: 同步 canonical 本地 Skill，维护内容锁。
sync-harness.mjs: 将 Harness 共享实现同步到各 npm 包并校验一致性。
validate-cursor.mjs: 校验 Cursor/Grok Bot 远程 OAuth 接线与显式 scope；拒绝本地启动、额外服务、秘密和 ChatGPT 客户端身份。
validate-grok.mjs: 校验 Grok manifest 与本地 MCP 接线。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
