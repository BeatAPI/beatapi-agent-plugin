# 正式扫描 14 项反馈本地核实

最新后续：用户另行授权后，本轮候选已在 d3c92a9ad 正式上线并重扫。原 12 项具体反馈未再出现，两项发现反馈仍在，另有六项新标记；未提交审核。见 MCP-FORMAL-REPAIR-RELEASE-2026-11-09.md，下面仍是当时本地核实阶段的记录。

后续：本地候选已另经用户授权完成独立全目录复扫，12 项原具体反馈和 2 项隐藏执行指控均未再出现；正式端点未更新。见 MCP-FORMAL-FEEDBACK-RESCAN-2026-11-09.md，以下保留本地修复阶段的边界与证据。

> 2026-11-09。本轮只核实和本地修复，未推送、部署、上传、重扫或提交审核，未运行付费业务。

## 处置结果

12 项确认为展示质量问题，已在统一 reference 展示词典修复；另 2 项“隐藏执行入口”判断与现有实现不符，保留工具并整理证据，没有为消除标签删掉发现能力或改变权限。

| 原能力 | 本地处置 |
| --- | --- |
| 品牌热榜分类 | 清晰表达“列出分类”，与分类下的榜单区分 |
| 品牌分类榜单 | 清晰表达按 category_id 查询榜单 |
| 粉丝兴趣话题 | 说明 sec_uid、近三天、最多十个话题 |
| 粉丝画像 | 说明 option 选择画像维度，不暗示返回粉丝名单 |
| 粉丝兴趣作者 | 说明是受众感兴趣的作者，不是粉丝身份列表或关注操作 |
| 粉丝搜索词 | 说明报告的受众搜索兴趣信号，不描述为逐人活动记录 |
| 热门内容词详情 | 说明 keyword、word_id、query_day，区别于视频搜索 |
| 热门内容词列表 | 说明分页和 date_window 报告窗口 |
| 创作者中心热门视频榜 | 说明分类、排序和报告周期 |
| 创作者中心相关素材 | 原说明已可用，但技术名被截断；本地命名明确相关素材用途 |
| 创作者中心配置 | 说明读取素材筛选配置，不修改创作者设置 |
| YouTube search_channel | 保留技术名，补充 channel_id/search_query、地区语言及翻页，避免与无频道上下文的搜索混淆 |

11 个旧技术名共享被截断的前缀和摘要，无法直接区分用途；用已存在的显式展示词典配置替换为短而明确的操作名，没有引入另一套命名器。YouTube 那项只改标题/说明，不增加一次额外技术名迁移。完整旧名→新名和逐项描述在 changes.json。

用途依据为已保存契约、网关精确路由与可核实的第一方文档；不是运行成功或账户授权范围的证据。仅具有 account/sec_uid 输入并不能证明任意账号数据均公开或均可访问，本轮没有作这样的承诺。响应字段未明时不添加猜测。内部来源与供应商链接只放被隔离的 internal-sources.json，不进入公开文案或对外说明。

## 两项误判依据

对象：`capabilities_search`、`capabilities_inspect`。反馈认为它们可能执行未单独暴露的操作；现有代码证据表明它们是目录查询，不是通用执行器：

1. 已上线 Schema 都是 additionalProperties=false。搜索只接受 query/kind/platform/limit/cursor/group_by；检查只接受 reference，不接受 input、operation、model、tool 或 idempotency_key。
2. `service/beatmcp/dispatch.go` 的发现分支只建立经过固定绑定过滤的 registry，并把 action 设为 search/inspect；不会进入设为 run 的分支。
3. `router/beatapi-mcp-executor.go` 虽共用名为 Execute 的适配回调，但 search/inspect 分别路由到两个只读 controller，只有 run 才装配账户与提交执行中间件。函数名字不是存在隐藏模型执行的证据。
4. `controller/beatapi_capabilities.go` 的两个 controller 只调用 registry.Search/Inspect，返回目录、参数、报价和下一步建议；next 是客户端指引，不会自动发起执行。协议适配还将 next 限定到已公开的固定工具。
5. 原有 SDK 回归已经证明未发布 registry 项不泄漏。本轮扩展同一个回归：匿名 search 和 inspect 分别到达对应 action、grant=nil；给两者分别注入五种执行字段，共十种请求全部在门禁拒绝，不进入适配回调。

SDK 测试使用隔离 registry、SQLite、TLS 测试服务及可观察 mock 回调，没有连接生产或调用付费服务。运行期实现没有改动，新增的是回归断言。不能把模拟测试表述为重新执行过生产业务。

对外英文说明草稿见 MCP-DISCOVERY-REVIEW-NOTE-2026-11-09.md；未实际申诉或提交。

## 保真与验证

- 基线严格使用已上线的冻结 986 目录，不从最新契约重新编译能力清单。
- 仍为 **986 工具 / 982 执行绑定**；12 个描述符只改 name/title/description，其中 11 个技术名变化。
- 其余 **974 个描述符完整相等**；发现工具、读取工具、共享指引和 UI 原样保留。
- 全部 inputSchema、outputSchema、annotations、OAuth scopes、schemaHash、模式、默认值、条件、枚举和读取引用逐字/对象相等；绑定只迁移键名，982 个值按 reference 比较相等。
- 先添加新展示回归并观察旧名断言失败，再修词典；本轮 `npm run verify` 通过 **67 主测试 + 16 Harness 测试**。
- 本机修复后完整目录通过 SDK 装载/分页与 MCP race 全套回归。`git diff --check` 通过；修改的源码文件均小于 800 行。

本地候选位于 `submission/artifacts/mcp-formal-feedback-14-20261109/remote-catalog.json`，不是当前线上目录。将来若获准发布，11 个名称迁移仍需要正式宿主重新发现/扫描；本轮不声称这些反馈已从 OpenAI 消失。

插件实现修改在 scripts/remote-presentation.mjs 和 test/remote-metadata.test.mjs。网关仅增加测试和测试地图，在 `/tmp/beat-mcp-catalog-986-20261109` 中，补丁另存 discovery-regression.patch；原网关工作区先前的未提交修改保持原状。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
