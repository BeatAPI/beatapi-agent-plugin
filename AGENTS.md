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
.codex-plugin/, .cursor-plugin/, .grok-plugin/ - 本地宿主兼容配置，不作为远程公开包直接上传
.github/ - CI 与标签发布流程
</directory>

公开发布走远程 MCP + OAuth；保留本地安装能力。账户、用户授权、任务与计费由 beat-new-api 网关负责，不在本仓库实现第二套后端。
2026-11-10 用户告知已提交审核；当前仅按用户报告记录，未再次读取门户。Git 收口不重传公开包、不重新扫描、不改审核快照或部署，详见 submission/GIT-CLOSEOUT-2026-11-10.md；以下旧轮次的“未提交”仅保留当时事实。
远程送审展示名为 BeatAPI Agent Toolkit；稳定包名 beatapi-agent-plugin、Skill 标识 beatapi 与本地宿主展示配置不随公开名称变更。
公开包企业署名由用户确认为 Logiavox LLC；本地宿主保留 BeatAPI 品牌署名，门户认证身份仍须独立核对。
远程展示默认英文，中日文翻译随同一 manifest 构建；私有 App 的实际显示和认证署名由宿主控制，不以源码导出冒充账户已更新。
现有本地三工具通用接口保持兼容；公开 MCP 的独立操作从网关完整契约生成，不另外维护模型、平台或价格清单。编译产物不是已部署服务。
公开范围由编译器按精确 reference 排除私信唤起、设备注册、凭证获取和广告主会话工具；目录验证拒绝重新引入，网关消费同一编译产物，本地三工具和原 API 不受影响。
用户已确认仅在公开目录排除 data:tiktok.web.device_register 和 data:bilibili.huahuo.dmp_pkg_list；原 API/本地工具不变。986 工具目录已在网关 ffe8fbb7b 修复六项榜单技术名，保留所有既有修复；同一正式草稿 986 complete、六条名称具体反馈消失，但两个发现工具被标记 fail，另 485 通用理由含 279 fail/206 needs_investigation，不是全部通过，未提交审核；备份/回滚与复核依据见 submission/MCP-RANKING-NAMES-2026-11-09.md。BeatAPI 钱包 OAuth 不自动建立广告主人群资产权限，后者重新公开前须提供授权证据。
最终提交弹窗已明确将 MCP findings 列为非阻断，不应仅凭 fail 推断禁止送人工审核。私有复核说明已填但未发送，六项政策/法律声明与最终 Submit 留给用户；入口/证据与交接见 submission/MCP-SUBMISSION-HANDOFF-2026-11-09.md，允许提交不等于审核批准。
公共 Schema 在 scripts/remote-schema.mjs 统一投影：无效示例/默认值只修正注解，不改调用值或后台默认；password/writeOnly 契约整体排除。结果 envelope 同源导出到网关，匿名预检同时读取关联 UI 的独立域和 CSP。
展示语义由 scripts/remote-presentation.mjs 统一提供，歧义操作按 reference 维护；紧凑投影仅删除注解。公开范围投影只删统一策略排除的工具及读取引用，其他 Schema/默认值/权限和历史枚举逐项保留，校验器拒绝重新引入策略排除引用；运行期仍按现有绑定验证实际读取权限。
六项展示修复复用统一词典，四个技术名迁移；完整 986 目录保留所有参数/权限。独立复扫零具体反馈只是诊断历史；后续正式上线/重扫另经用户授权，当前状态以上方正式发布记录为准。
四项抖音媒体链接/分享与四项星图名称仅改展示、保留所有参数/权限；独立复扫零具体反馈/904 通用提示是历史诊断，随后已获授权正式发布并重扫，当前结果以上方正式记录为准，原核实见 submission/MCP-XINGTU-NAMES-2026-11-09.md。
模型技术名仍基于原契约标题与 reference 摘要生成，展示词典 title 的修订不参与技术名生成。已核实的 HC 展示为 high-cache，不推断其他未知缩写，也不添加缓存命中或并发能力承诺。
文本模型的默认可读标题按类别表达 Generate Text 动作，保留字面模型 ID；说明与技术名不拼接展示标题，已核实的专用标题优先。不按扫描反馈维护另一份模型名单。
通用执行指引可通过 --shared-instructions 显式提升到 MCP initialize instructions；默认构建不变。网关必须消费同一目录字段，匿名预检拒绝共享指引丢失，不能只删工具说明而不传给宿主。
修改前读 CONTRIBUTING.md。不直接修改 skills/ 或 mcp/vendor/ 同步内容。公开包不得包含本地启动配置、CLI 依赖、私有 App 绑定或凭证。
验证用 npm run verify；远程构建另需真实 MCP 配置并执行线上只读预检。打包不等于 OAuth 联调、审核通过或发布。
公开 ZIP 还必须通过固定 v2 目录与服务端工具逐项一致性扫描；OAuth-only 仅供诊断。所有扫描保持匿名，不调用业务工具。
公开打包需传入已人工核验播放及审核员访问权限的 --demo-recording-url；构建器只校验 URL 并写入包，不声称完成录像验收。缺录像仍可运行离线检查和匿名预检。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
