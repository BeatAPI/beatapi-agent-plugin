# 正式扫描新增六项反馈：本地修复

后续独立诊断复扫已另经用户授权完成，见 MCP-FORMAL-FEEDBACK-6-RESCAN-2026-11-09.md；下文“未扫描”仅描述本轮本地修复阶段，正式端点仍未更新。

## 核实范围

基线为已发布网关 d3c92a9ad3916dd61d521d57c22cef5503e4d1c0 的完整 986 工具快照。正式扫描 attempt `01a1bfca-7eda-7727-b226-c7dacc0f5cfd` 在 2026-11-09 10:15:09 UTC 完成：六项新名称/说明反馈，另有两项发现工具待调查反馈。本轮不联网调用业务工具，不部署、不更新草稿、不扫描、不提交审核。

## 六项确定的问题

| 能力 | 核实结论与本地处理 |
| --- | --- |
| Bilibili 视频榜 | 原技术名是接口路径加摘要，确实难理解。改为 `beatapi_bilibili_get_video_rankings`，说明是花火高表现商业视频榜，非 UP 主榜；category 传行业名称而非 ID，空值全部，page 从 1 开始。未虚构统计周期。 |
| Lemon8 搜索 | 原说明只有“搜索接口”，缺少选择器和翻页方式。补齐 Top/Accounts/Hashtags/Posts、筛选、排序和 max_cursor/has_more；保留原技术名。参数描述中 article 的截断语义已核实为 Posts，但本轮不重写任何 Schema。 |
| 皮皮虾搜索 | 原说明没有说明搜什么。补齐综合/热门/新鲜/视频/图文/用户/话题和 offset 翻页；search_type 与 offset 均保持字符串，保留原技术名。 |
| 小红书内容广场 | 原技术名无法表明榜单用途。改为 `beatapi_xiaohongshu_get_content_rankings`，说明八种榜、3/7/14/30 日窗口及按榜适用的筛选；是榜单查询，不是投广告、联系客资或发起合作。 |
| 知乎盐选搜索 | 原名含糊。改为 `beatapi_zhihu_search_yanxuan_content`，标明 Yanxuan 内容搜索、字符串分页和可选搜索哈希；不承诺全文下载或绕过付费限制。 |
| 知乎用户划线 | segments 不是人群分层，实际为 lineComments 划线列表。改为 `beatapi_zhihu_get_user_highlights`，明确 `user_url_token` 这个旧字段必须传 member hash ID，而非主页 URL token；不改参数名，不推断所有划线公开可读。 |

以上语义对照固定 schemaHash 的原始契约、现有执行路由和公开第一方契约资料。内部来源单独保存在忽略归档的 `internal-sources.json`，不进入插件或对外说明。没有实际读取任意用户的划线或付费全文；真实可见性边界不是本轮已完成的验收。

## 两项发现工具的复核依据

`capabilities_search` 与 `capabilities_inspect` 仍被标记为可能隐藏执行操作。实现证据不支持这一判断，因此保留并整理复核说明，而不是删掉能力或增加运行分支：

1. `service/beatmcp/server.go:164` 两个封闭 Schema 仅接受检索条件或 reference，不接受执行参数。
2. `service/beatmcp/dispatch.go:28` 匿名发现只分派 search/inspect，并把目录裁剪为已发布、schemaHash 匹配的绑定；run 是另一分支。公共 Execute 回调会处理合法的元数据请求，不能把回调名称误认为业务执行。
3. `router/beatapi-mcp-executor.go:38` search/inspect 直达目录控制器；账户与提交链只属于 run。控制器 `BeatSearchCapabilities` / `BeatInspectCapability` 查询注册表；返回 next 建议并不执行 next。
4. `service/beatmcp/server_test.go:171` 使用真实 SDK、临时 SQLite 和本地 TLS mock，验证匿名分派、未发布引用过滤及十种执行字段注入在回调前被拒绝。现有回归本轮重新通过，未修改后端代码。

同定义的独立扫描曾不标记，而正式扫描仍标记；这只能证明判定有差异，不能证明 OpenAI 已认可我们的解释。英文草稿见 `MCP-DISCOVERY-REVIEW-NOTE-2026-11-09.md`；本轮没有提出申诉或提交审核。

## 影响与保真

- 复用统一 `remote-presentation.mjs` 语义词典及现有展示投影，未增加第二套执行架构。
- 986 个 SDK 工具保留，982 个执行绑定保留。仅六个工具的 name/title/description 变化，其中四个技术名迁移；另外 980 个描述符逐字段相等。
- 全量 inputSchema/outputSchema、默认值、枚举、nullable、数值边界、additionalProperties、幂等约束、scope、annotations、UI 元数据完全相等；全部绑定值、共享指引、发现工具、读取工具历史枚举与资源正文完全相等。
- 候选基于上一版冻结目录，只投影目标六项，没有按更新的全量契约重新生成目录。SDK 基线与上轮生产快照逐工具相等。
- 未修改任何网关内置目录、后端源码或线上配置。未来若获准发布，四个旧技术名不会自动兼容，需刷新同一草稿工具元数据；本轮不创建别名扩大公开工具数量。

## 本地验证

`node --test test/remote-metadata.test.mjs`：18/18。`npm run verify`：68 项主测试、16 项 Harness 全部通过，包括类型检查、构建、打包源检查。

网关本机 `TEST_BEAT_MCP_CATALOG_PATH=<候选> go test -race ./service/beatmcp -count=1` 通过，包括完整候选目录与发现隔离回归。首次沙箱运行被回环端口 EPERM 阻止，允许本地 mock 端口后重跑通过；不是修复业务代码后才通过。

证据与可复现生成器见 `artifacts/mcp-formal-feedback-6-20261109/`。新候选尚未部署、尚未重新扫描，因此不能宣称这六条已在 OpenAI 后台消失；原 497 条通用复核提示也未被本轮扫描重新评价。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
