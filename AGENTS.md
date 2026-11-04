# BeatAPI Agent Plugin - Agent 接入与跨宿主发布
Node.js + TypeScript + MCP SDK + portable plugin manifests

<directory>
mcp/ - 本地 stdio MCP 与同步网关客户端；不实现托管授权或计费
skills/ - 从 beatapi-skill 同步的本地安装 Skill，不直接修改
scripts/ - 契约同步、宿主校验、本地与远程发布构建，见 scripts/AGENTS.md
submission/ - 通用远程 Skill、目录生成接线规范和审核准备，社媒仅用于读取调研，见 submission/AGENTS.md
test/ - MCP 行为、安全边界与发布回归，见 test/AGENTS.md
assets/ - 插件浅/深色品牌 PNG 与小图标，见 assets/AGENTS.md
contract/ - 上游 OpenAPI 快照
generated/ - Skill 与客户端同步锁
packages/ - DeepSeek Harness 插件包，独立于 OpenAI 公开包
harness/ - Harness 共享运行时、同步校验与测试
.codex-plugin/, .cursor-plugin/, .grok-plugin/ - 本地宿主兼容配置，不作为远程公开包直接上传
.github/ - CI 与标签发布流程
</directory>

公开发布走远程 MCP + OAuth；保留本地安装能力。账户、用户授权、任务与计费由 beat-new-api 网关负责，不在本仓库实现第二套后端。
远程送审展示名为 BeatAPI Agent Toolkit；稳定包名 beatapi-agent-plugin、Skill 标识 beatapi 与本地宿主展示配置不随公开名称变更。
公开包企业署名由用户确认为 Logiavox LLC；本地宿主保留 BeatAPI 品牌署名，门户认证身份仍须独立核对。
远程展示默认英文，中日文翻译随同一 manifest 构建；私有 App 的实际显示和认证署名由宿主控制，不以源码导出冒充账户已更新。
现有本地三工具通用接口保持兼容；公开 MCP 的独立操作从网关完整契约生成，不另外维护模型、平台或价格清单。编译产物不是已部署服务。
公开范围由编译器按精确 reference 排除私信唤起、设备注册、凭证获取和广告主会话工具；目录验证拒绝重新引入，网关消费同一编译产物，本地三工具和原 API 不受影响。
修改前读 CONTRIBUTING.md。不直接修改 skills/ 或 mcp/vendor/ 同步内容。公开包不得包含本地启动配置、CLI 依赖、私有 App 绑定或凭证。
验证用 npm run verify；远程构建另需真实 MCP 配置并执行线上只读预检。打包不等于 OAuth 联调、审核通过或发布。
公开 ZIP 还必须通过固定 v2 目录与服务端工具逐项一致性扫描；OAuth-only 仅供诊断。所有扫描保持匿名，不调用业务工具。
公开打包需传入已人工核验播放及审核员访问权限的 --demo-recording-url；构建器只校验 URL 并写入包，不声称完成录像验收。缺录像仍可运行离线检查和匿名预检。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
