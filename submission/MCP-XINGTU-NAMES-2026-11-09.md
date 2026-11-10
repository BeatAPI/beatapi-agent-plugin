# 星图四项工具名称核实与独立扫描

> 2026-11-09，北京时间。仅本地修复和独立诊断，不修改正式端点、正式草稿或审核账号，不提交审核/申诉，不执行付费业务。

后续：用户另行授权累计八项正式发布，已在 `243229fdf` 部署并完成同一草稿扫描；本文件保留此前独立诊断事实，最新状态见 `MCP-FORMAL-EIGHT-RELEASE-2026-11-09.md`。

## 核实与修复

四项名称问题成立：原展示标题仍是接口 ID，技术名混有缩写/截断路径，不能清晰区分内容表现、连接用户来源、合作效果预估和视频触达。已对照固定 schemaHash 的原契约与第一方文档；内部来源仅存于忽略归档的 `internal-sources.json`，不进入公开插件包或对外说明。

| reference 后缀 | 新技术名 | 已核实用途与边界 |
| --- | --- | --- |
| xingtu.kol_rec_videos_v1 | beatapi_douyin_get_creator_content_performance_v1 | 按 Xingtu kolId 读取创作者内容表现；不从 rec 缩写推断通用推荐流，不虚构返回指标、统计周期或保证预测。 |
| xingtu.kol_touch_distribution_v1 | beatapi_douyin_get_connected_user_sources_v1 | 按 kolId 读取连接用户来源分布；原接口仅有 kolId，不添加时间范围或来源选择器，不把来源分布当成粉丝名单或联系授权。 |
| xingtu_v2.get_author_commerce_spread_info | beatapi_douyin_get_creator_campaign_estimates | 按 o_author_id 读取短视频合作性价比及效果预估，文档明确 CPM/CPE、植入与定制视频；不保证实际投放收益，不视为实际结算收费或下单投广告。 |
| xingtu_v2.get_author_touch_distribution | beatapi_douyin_get_creator_video_reach_distribution | 按 o_author_id 和两个整数平台选择器读取视频触达分布；与 V1 连接用户来源区分，不虚构分布维度或推断具体观众身份。 |

文档没有充分公开的响应字段不补写。没有真实查询创作者或验证业务可见性，不宣称所有数据公开，也不把 BeatAPI OAuth 当作广告主私有资产授权。V1 文档涉及服务侧访问上下文，不向插件暴露内部来源或访问账户。

## 架构与保真

复用 `remote-presentation.mjs` 的已核实语义词典及现有展示投影，没有新增运行期分支或参数解释器。保留上轮四项媒体链接/分享修复，不回退它们，也不重新从更新的全量能力契约生成目录。

本轮相对上一轮完整候选仅改四个工具的 name/title/description 与四个绑定键名，另 982 个 SDK 描述符逐字段相等。相对当前正式 `1dcbae3a8` 累计八项本地展示修订，仍为 986 个工具、982 个执行绑定，所有其他字段相等。

全部 input/output Schema、默认值、枚举、nullable、required、数值边界、additionalProperties、annotations、OAuth scopes、schemaHash、执行模式和绑定值不变；共享指引、发现工具、任务/结果历史枚举与原 UI 保留。kolId/o_author_id 不互换；两个整数平台选择器仍默认 1，不新增枚举、限制为 1 或强转字符串。

原四个技术名没有自动别名，未来若正式发布须刷新客户端发现；本轮仅诊断，不更新正式目录。

另做只读可读性盘点：候选中仍有 777 个数据工具的展示标题直接等于原始接口 ID，清单见 `naming-audit.json`。这不是 777 条已判定的扫描错误，也没有自动修改它们；但说明同类可读性风险不止本轮四项，后续宜按语义分组集中核实，而非仅等待每轮扫描挑出几项。

## 本地验证

新增表驱动回归覆盖 V1/V2 标识、稳定 reference、缺参/错字段拒绝、整数类型、默认省略以及未来整数选择值保留。完整 `npm run verify` 的 **70 项主测试、16 项 Harness** 通过；20 项展示测试包含在其中。

候选通过 `TEST_BEAT_MCP_CATALOG_PATH=<候选> go test -race ./service/beatmcp -count=1`；后端工作区未修改。独立 Worker 五项回归和 CF dry-run 构建通过。

## 独立扫描

复用原独立草稿 `plugin_asdk_app_6af04252daf48191b4656176b44669c1`，MCP key diagnostic，固定槽 `/mcp/scan-controls/single-text`，配置明确为 full-ui。所有客户端看到相同完整元数据，不按身份隐藏能力；业务调用统一拒绝，不访问账户或源站。

Worker version `6f260227-9eaf-47b5-b357-02f11ffe197d`，deployment `c25942c8-4ea4-4f18-9ec1-62478ccb20eb`；截止时间 2026-11-09 22:00 北京时间。匿名十页读取的全 986 描述符、共享指引、资源和 HTML 与冻结候选逐项相等后，才触发一次 Rescan。

第一次只读预检在 tools/list 收到 404，未查明该次响应唯一根因；没有重复部署，随后同一端点完整十页读取全部通过。未在预检失败时触发扫描。

本轮 scan：`asdk_app_6af04252daf48191b4656176b44669c1~AppsSDKContinuousScan_7d09dcc08bd481919246ca7f3a0cea54`；attempt：`01a1c060-cac2-75c0-a9ea-c32fa08678cd`。Rescan 20:55:24，scan_time 20:58:31，completedAt 20:59:38，只触发一次。

- **986/986 complete**，共享指引 complete 且无 findings，problem=null、activeRun=null，没有 unknown。
- 四条星图名称具体反馈均未再出现；各保留一条通用“需进一步审核”提示，不是全部 findings 清空或已获准发布。
- 全目录 **零具体反馈**，另有 **904 条通用复核提示**，allToolsPass=null；两个发现工具全部 findings 为空。
- 门户全 986 个 action_name/title/description、input/output Schema、annotations 和认证声明，以及共享指引均与新候选逐项相等，不是读取旧扫描结果。

独立草稿以前也曾对其他目录给出零具体反馈，而正式草稿反馈不同；不能仅凭本轮结果证明因果，也不能保证正式重扫必然相同。正式端点与正式草稿仍未更新，当前正式反馈保持上轮状态。

已精确删除本轮唯一诊断路由 `175d690bec524428b11f03c4afb5e3da`，剩余路由与部署前相等，原域名验证路由保留。独立草稿保持 Not submitted / Not published；撤路由后的正式完整元数据及健康复验见 `formal-after.json`。

撤路由后正式全量读取首次在第九个 RPC（tools/list）发生 40 秒连接超时，只重试匿名元数据读取，没有再次扫描。重试后正式全部 986 描述符、initialize、资源列表和 UI 正文与本轮开始前逐项相等；诊断路径 404、域名验证 200、网关健康 200。未因此修改正式服务或推断某个后端故障根因。

证据与可复现脚本：`artifacts/mcp-xingtu-names-20261109/`。独立诊断不等于正式草稿通过、真实业务联调或审核批准。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
