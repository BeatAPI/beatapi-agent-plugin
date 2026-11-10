# 抖音媒体链接与分享工具名称核实

后续四项星图反馈已另经用户授权在本地核实修复，并保留本轮媒体/分享修复一起完成新独立扫描；最新候选见 MCP-XINGTU-NAMES-2026-11-09.md。本文件保留本轮历史，正式端点仍未更新。

> 2026-11-09，北京时间。用户仅授权本地修复与完整目录独立诊断扫描；不修改正式端点、正式草稿，不提交审核或运行付费业务。

## 四项反馈核实

四项名称问题成立：原技术名由接口路径截断加摘要构成，展示标题仍是原始路径，不能清晰区分“单条/批量链接读取、分享口令解析、二维码生成”。已对照固定 schemaHash 的原契约与第一方契约文档核实；内部来源保存在忽略归档的 `internal-sources.json`，不进入公开包或对外说明。

| reference 后缀 | 新技术名 | 语义边界 |
| --- | --- | --- |
| fetch_multi_video_high_quality_play_url | beatapi_douyin_get_original_video_playback_urls | 批量读取原始上传画质播放链接；aweme_ids 为逗号分隔字符串，文档上限 50，不是数组。region 用于请求出口/CDN 选择。不是上传、转码或画质增强。 |
| fetch_video_high_quality_play_url | beatapi_douyin_get_original_video_playback_url | 单条原始上传画质播放链接；优先 aweme_id，没有时用 share_url。region 不是搜索市场或分辨率参数。没有承诺把低画质恢复为高清。 |
| fetch_share_info_by_share_code | beatapi_douyin_resolve_share_code | 解析内容分享口令，返回分享元数据和内容标识，含受支持的文章分享；不是登录验证码，也不自动再调用内容接口或发送分享。 |
| generate_douyin_video_share_qrcode | beatapi_douyin_generate_share_qr_code | 生成分享二维码数据；按既有契约保留 object_id 为视频 ID 或作者 UID，不擅自缩为仅视频。不是登录二维码、视频生成、发布、扫码或关注操作。 |

没有实测任意视频、分享口令或作者 UID 的业务结果，不把文档核实冒充真实收费执行；不承诺无水印、无损、固定分辨率或绕过内容访问限制。价格仍由当前 BeatAPI 契约发现，不把内部文档价格写入插件。

## 本地实现与影响

只扩展现有 `scripts/remote-presentation.mjs` 语义词典，使用现有展示投影；没有新建参数解释器、名称启发式或运行期特判。

基线为正式 `1dcbae3a8e7eb3d36c4b90f692922c947daeeb1b` 的冻结目录及 SDK 快照，并与本轮新读的正式元数据逐项比对。保留此前六项修复，不根据更新的全量能力快照重新生成目录。

- 986 个 SDK 工具、982 个执行绑定保留。只改四项 name/title/description 与四个绑定键名，另 982 个描述符逐字段相等。
- 全部 Schema、默认值、枚举、nullable、required、additionalProperties、幂等字段、权限、annotations、schemaHash、模式和绑定值相等；共享指引、发现工具、任务/结果读取历史枚举及原组件相等。
- 批量 ID 的既有默认值、单条 ID/link 原省略规则、region 的批量 nullable/单条非 nullable 均保留。没有把用途说明变成新 required、oneOf、数组类型或地区枚举。
- 公开候选四个旧名称没有自动别名；将来正式发布需刷新客户端发现，本轮不发布它们。

## 本地验证

新增一组表驱动回归覆盖四种用途、稳定 reference、字符串批量 ID、原默认/省略语义、nullable、视频 ID 与作者 UID，以及错误类型/多余字段拒绝。19 项展示测试通过；完整 `npm run verify` 的 69 项主测试与 16 项 Harness 全部通过。

完整候选通过 `TEST_BEAT_MCP_CATALOG_PATH=<候选> go test -race ./service/beatmcp -count=1`，后端工作区无修改；独立 Worker 5 项回归与 CF dry-run 构建通过。

## 独立诊断扫描

复用原独立插件 `plugin_asdk_app_6af04252daf48191b4656176b44669c1`、MCP key diagnostic 和固定诊断槽 `/mcp/scan-controls/single-text`，配置明确为 full-ui，对所有客户端返回相同完整目录及 UI，不按扫描器身份隐藏能力。

Worker version `4962f9f5-3b59-49a1-a7f6-49fd2c7ec323`，deployment `2d9dd8e0-1f87-4a5b-aacd-104ed97edfe8`；截止时间 2026-11-09 21:00 北京时间。实际部署及匿名十页读取的 986 描述符、指引、资源和 HTML 均与本地冻结候选相等。业务调用统一拒绝，不访问账户或源站。

本轮 scan 为 `asdk_app_6af04252daf48191b4656176b44669c1~AppsSDKContinuousScan_7ee5dd61d8308191b79f0ea5715d9993`，attempt `01a1c054-3136-7e42-a842-a3ea1c4fe6fe`。Rescan 20:41:41，scan_time 20:44:49，completedAt 20:46:19；只触发一次。

- **986/986 complete**；共享指引 complete 且无 findings，problem=null、activeRun=null，没有 unknown。
- 原四条名称具体反馈全部未再出现；四个新名称各仍有一条通用“需进一步审核”提示，不能说全部 findings 清空或已获准发布。
- 两个发现工具均 complete，全部 findings 为空。
- 本轮另有 **4 条不同的星图工具名称反馈**、**909 条通用进一步审核提示**，allToolsPass=null。不能把独立结果当作正式草稿反馈已清除。

新增四项原文与完整定义见 `new-findings.json`。它们本轮未修改，逐字段等于正式基线：

| reference | 原说明 |
| --- | --- |
| data:douyin.xingtu.kol_rec_videos_v1 | 获取kol内容表现V1 |
| data:douyin.xingtu.kol_touch_distribution_v1 | 获取kol连接用户来源V1 |
| data:douyin.xingtu_v2.get_author_commerce_spread_info | 获取创作者性价比与效果预估 |
| data:douyin.xingtu_v2.get_author_touch_distribution | 获取创作者视频触达分布 |

这些是本轮新标记的名称问题，不代表新运行故障；本轮没有继续推断缩写语义、修改它们或缩小目录。此前同一诊断槽也曾对其他目录给出不同反馈，因此不能仅凭扫描差异断言修复的因果或正式复扫必然一致。门户 986 个 action_name/title/description、input/output Schema、annotations 和认证声明，以及共享指引均与冻结候选相等。

20:46:45 已精确删除本轮路由 `88aba3035aac4e91b6048dd9ef18d68c`；剩余路由与部署前相等，域名验证路由保留。首次路由只读查询发生连接超时，核实后仅重试 GET，没有重复部署或触发扫描。撤路由后确认正式全部 986 描述符、initialize、资源列表和 UI 正文与本轮开始前相等；诊断路径 404、域名验证 200、网关健康 200，见 `formal-after.json`。

## 边界与证据

正式目录、后端内置文件、正式草稿、OAuth、DNS、价格/计费和审核凭证均不修改，不提交审核/申诉。完整证据及可复现脚本位于 `artifacts/mcp-douyin-media-20261109/`。独立扫描不替代真实 OAuth/业务联调或正式审核；即使没有具体反馈，也不能据此宣称审核通过。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
