# 六项榜单工具技术名称修复

> 2026-11-09，北京时间。修复前一轮正式扫描的六条名称反馈，保留能力/参数/权限，原草稿重扫，最后提交留给用户。

后续提交门禁核对：23:19 最终确认弹窗明确将这些 MCP findings 列为 Non-blocking findings，可以带私有说明申请人工审核，不要求先消除所有自动标记。原 fail 和扫描记录保留不变；不能把“未全部通过”直接等同“禁止提交”。最新交接见 `MCP-SUBMISSION-HANDOFF-2026-11-09.md`。

## 修复依据

这些工具虽已有部分可读标题，技术名仍含原路径、截断缩写和摘要，不能直接表达用途。此次在已有 remote-presentation 词典中维护六个已核实语义名称，不另建执行接口或参数适配层。

| 固定 reference 后缀 | 新技术名 |
| --- | --- |
| bilibili.huahuo.popular_up_x_huo | beatapi_bilibili_get_industry_creator_rankings |
| bilibili.huahuo.x_huo_date_options | beatapi_bilibili_list_creator_ranking_periods |
| douyin.billboard.fetch_hot_total_high_fan_list | beatapi_douyin_get_follower_growth_rate_rankings |
| douyin.billboard.fetch_hot_total_high_like_list | beatapi_douyin_get_like_rate_rankings |
| douyin.billboard.fetch_hot_total_high_search_list | beatapi_douyin_get_rising_search_rankings |
| douyin.billboard.fetch_hot_total_high_topic_list | beatapi_douyin_get_rising_topic_rankings |

Bilibili 两项沿用此前已核实的行业创作者榜单与可用期数语义，仅改技术名。四项 Douyin 对照固定契约及第一方开发说明，区分增粉率/点赞率与总数量、搜索热度与话题热度；不推断未公开的响应字段或个体身份。公开说明不包含内部供应商身份或地址。

三个 Douyin 榜单使用 page 与结构化 tags；搜索榜使用 page_num 且没有 tags。date_window 文档列出 1/24/72/168 小时，但原 Schema 仅约束整数，仍保留其实际接受集合，不新增 enum。tags 的嵌套 nullable、空关键词、默认省略与 Bilibili rank_date=null 均保留。

## 无损边界与回归

仍为 986 工具、982 固定执行绑定；六项 name/title/description 和六个绑定键名可变，另 980 描述符完整相等。所有绑定值、input/output Schema、默认值、枚举、required、nullable、additionalProperties、annotations、scopes、schemaHash、执行模式、历史读取枚举、共享指引和组件保留。之前 Instagram/星图/媒体修复不回退。

六个旧技术名不自动提供别名，客户端须刷新工具发现；执行 reference、原 API 与本地通用工具不变。未改网关运行代码、计费、OAuth、价格、数据库或任务归属，未做付费业务调用。

22 项展示/保真回归和完整 MCP race 回归通过；覆盖分页字段隔离、开放整数、默认省略、嵌套可空标签、缺参/错误类型/额外字段拒绝。全候选保真、反向补丁检查和 diff 检查通过，不冒充全仓库回归。

## 发布与回滚

基于最新 main `19ef64b10dfa060e847e41e961b3ed65728f7507`，原始目录逐字备份和摘要保存在 `artifacts/mcp-ranking-names-20261109/catalog-before.json`、`preservation.json`。本轮独立 worktree 只提交目录与模块地图；原后端五项未提交改动保持原样。

提交 `ffe8fbb7b36d64205cd6c61b40dbaceae4b1adb0` 已推送，[部署工作流 42637626844](https://github.com/fengshao1227/beat-new-api/actions/runs/42637626844) success，22:58:53 结束，耗时 14 分 20 秒；精确提交服务检查和 Craft 路由检查成功。回滚只在最新 main revert 本轮提交并走既有蓝绿流程，再核对旧目录/刷新原草稿；不 reset、不强推或撤销此前修复，没有数据库迁移，未实际执行生产回滚演练。

同一 0.4.0 草稿的上一轮已下载包不引用六个旧名，5 正向/3 负向案例中工具均存在；不重新上传相同 ZIP 或重置声明/审核账号。此包检查使用已归档包，不冒充本轮新下载。只在新目录读回一致后触发一次正式扫描，不提交审核。

部署尚未结束时一次读回遇到 TLS 失败，另一次分页累计 990 项，未在这两次结果上启动扫描，也未因此重复部署。其唯一原因未核实，不把发布期间的现象当成已证实的代码故障。部署成功后全新十页读取为 986 个唯一工具、无重复项，所有描述符和共享指引与候选逐项相等，健康 200；该验收完成后才触发本轮唯一 Rescan。

## 正式扫描结果

- scan：`asdk_app_6aed1b32cb0c81919339954cee14a350~AppsSDKContinuousScan_0c47e9d889748191ab19dd2ff14ada30`。
- attempt：`01a1c0d2-81c7-7e19-ba46-ca5702b1a112`，scan_time 23:03:17，completedAt 23:04:44。
- 986/986 complete，problem=null、activeRun=null，共享指引 complete 且无 findings，没有 unknown。
- 六项名称具体反馈均消失，五项全部 findings 为空；Bilibili 行业创作者榜工具仍有一条“新定义需要进一步审核”的通用理由，decision 为 fail，不能说六项全部获准发布。
- 另有两个具体 fail：capabilities_search 和 capabilities_inspect 被认为可能执行未单独公开的操作。它们的完整定义与本轮前相等，不是此次技术名迁移引入的新执行入口。
- 全目录 485 条通用进一步审核理由，按原始 decision 分类为 **279 fail、206 needs_investigation**。分类按理由统计不表示可以忽略 fail；allToolsPass=null，不能宣称扫描全部通过或只剩提交按钮。

门户保存的全部 986 个 action_name/title/description、输入输出 Schema、annotations、认证声明及共享指引与冻结候选逐项相等。证据见 `comparison.json`、`portal-after.json`；没有用重复扫描挑选结果。

## 发现工具复核依据

两条发现工具标记疑似误判，依据不是“之前没标记”，而是实现和本轮已通过的官方 SDK 回归：两者只路由为 search/inspect，Schema 拒绝 input/operation/idempotency_key/tool/model；对十次执行字段注入均在回调前拒绝，匿名调用无执行 grant。未公开 registry 项也不进入发现结果。982 个执行操作仍各自以固定工具公开，执行需单独调用及对应 OAuth 权限。

该推断尚未得到 OpenAI 人工确认。英文说明已更新在 `MCP-DISCOVERY-REVIEW-NOTE-2026-11-09.md`，只准备材料，没有发起申诉或提交审核，也没有为了消除标记删除发现工具、隐藏能力或放松参数。

门户保持 Configured / Authorized / Domain verified / Not submitted / Not published；最终页面已留给用户。名称修复、生产部署与正式扫描均完成，但剩余 fail 尚待复核，不能包装成“审核通过”。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
