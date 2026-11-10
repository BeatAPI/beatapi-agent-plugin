# BeatAPI Agent Plugin - Agent 接入与跨宿主发布
Node.js + TypeScript + MCP SDK + portable plugin manifests

<directory>
mcp/ - 本地 stdio MCP 与同步网关客户端；不实现托管授权或计费
skills/ - 从 beatapi-skill 同步的本地安装 Skill，不直接修改
scripts/ - 契约同步、宿主校验、本地与远程发布构建，见 scripts/AGENTS.md
submission/ - 通用远程 Skill、审核证据与隔离的域名验证/协议诊断 Worker，社媒仅用于读取调研，见 submission/AGENTS.md
test/ - MCP 行为、安全边界与发布回归，见 test/AGENTS.md
assets/ - 插件浅/深色品牌 PNG 与小图标，见 assets/AGENTS.md
ui/ - MCP Apps 只读内联结果组件；源码在此，静态 HTML 显式构建到网关，见 ui/AGENTS.md
contract/ - 上游 OpenAPI 快照
generated/ - Skill 与客户端同步锁
packages/ - DeepSeek Harness 插件包，独立于 OpenAI 公开包
harness/ - Harness 共享运行时、同步校验与测试
cursor/ - Cursor/Grok Bot 远程 OAuth 候选的交互指引、同源生成 Skill 与登记/验收门槛
.codex-plugin/, .grok-plugin/ - 本地宿主兼容配置，不作为远程公开包直接上传
.cursor-plugin/ - Cursor/Grok Bot 远程发行 manifest；根 mcp.json 指向现有托管服务
.github/ - CI 与标签发布流程
</directory>

公开插件仅包含可复用源码、脱敏契约、测试、品牌和通用文档。审核账号、运行记录、录屏、后台/部署配置不得跟踪；submission 的公开输入按白名单维护，privacy:check 检查索引，历史清理另行授权。
账户、授权、任务与计费由网关负责，本仓库不实现第二套后端。远程包与本地安装包分别构建，构建不代表部署或真实宿主验收。
Cursor/Grok Bot 默认使用远程 MCP + OAuth；独立公共客户端仍需登记及真实联调。Codex/Grok Build 保持 .mcp.json 的本地运行时。通用远程 Skill 同源生成，禁止手改 cursor/skills 的生成文件；回调兼容依据见 cursor/OFFICIAL-COMPATIBILITY.md。
修改前读 CONTRIBUTING.md。skills/beatapi-video 与 mcp/vendor/client 是同步内容，使用 skill:sync/runtime:sync 更新，不直接编辑。
远程 Schema、展示与公开范围从统一契约编译，不维护重复能力清单；保留参数约束和最小权限，不泄露私有路由或凭证。
共享指引通过 initialize instructions 传给宿主；精简元数据不能丢失执行约束。结果组件只读，不创建任务，不把刷新变成付费重试。
验证使用 npm run verify；正式远程构建还须实际 OAuth/目录预检、已核验录像及宿主案例，不以 mock 测试冒充真实成功。
任何现有 OpenAI 审核包、正式端点、客户端登记和市场提交均须独立授权，不因本地代码提交而自动更新。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
