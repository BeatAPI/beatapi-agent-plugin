# 研究工具展示修复正式发布与复扫

后续新增六项反馈已另经用户授权修复上线并完成正式重扫，当前生产状态见 MCP-FORMAL-SIX-RELEASE-2026-11-09.md；本文件保留前一轮发布与扫描历史。

> 2026-11-09，北京时间。用户授权先备份、确认回滚，再部署已诊断的修复、更新同一正式草稿并扫描；不提交审核。

## 结果

- main 提交 `d3c92a9ad3916dd61d521d57c22cef5503e4d1c0` 已推送并部署；[工作流 42597273568](https://github.com/fengshao1227/beat-new-api/actions/runs/42597273568) success。
- 日志确认 18:11:26 `green is live at d3c92a9ad`，随后公共健康 200 和匿名 Craft 401 检查通过。
- 正式端点完整 **986 个描述符**与修复后冻结候选逐项相等；全部能力、参数、权限、读取枚举、共享指引及 UI 保留。
- 同一 0.4.0 正式草稿的 MCP 定义已通过 Rescan 刷新；正式扫描 **986/986 complete**，共享指引 complete、problem=null、activeRun=null。
- 原 12 项名称/说明具体反馈全部未再出现。两个发现工具仍被标记 needs_investigation；本轮另标记 6 项名称/说明反馈，共 **8 条具体反馈、497 条通用进一步审核提示**。allToolsPass=null，不能标记审核通过。
- 门户仍 Configured / Authorized / Domain verified / Not submitted / Not published。本轮未提交审核、申诉或发布。

## 备份和回滚

备份在 `submission/artifacts/mcp-formal-repair-release-20261109/`：

- `catalog-before.json`：当前内置 986 目录的逐字备份，SHA256 `a4fdfdb318f05ae29de5832b7c4cb1d6b992917f73dbaf80aaa68e36ae0bdf44`。
- `result-schema-before.json`：结果声明备份，SHA256 `225091fad6e7cd31bc81275de0569af3d28b926c5f78577a8b7d3a08b0ab6141`，本次没有改动该文件。
- 两份备份与前一成功部署 `e009ba8abdde8d60f989240f5fb031977adf2196` 的 Git 对象逐字相等，另保存发布前真实完整协议/组件快照和原草稿公开 ZIP。
- 反向补丁只检查验证通过，未实际执行生产回滚。

回滚应在最新主线反向撤销本次提交并走原蓝绿发布，或恢复目录备份并同步地图后提交部署；不要 reset/强推到更旧版本，不能因此撤销此前已经上线的其他修复。原共享指引支持、内置目录选择、OAuth、结果声明和账务设置均保留。恢复后核对旧 986 描述符及 UI，并重新扫描同一草稿；网关回退不会自动恢复 OpenAI 已存的元数据。未进行数据库迁移或生产回滚演练，不依赖旧容器永久保留。

## 发布边界

先读取远端最新主线，发现已有一个与本次无关的支付修复已成功上线。独立工作区基于该最新版本构建，没有用旧分支覆盖它。原工作区的既有未提交修改保持原样。

本次提交仅三个文件：

- `service/beatmcp/catalog_default.json`：12 个描述符只改 name/title/description，其中 11 个旧截断技术名迁移到清晰名称；其余 974 个 SDK 描述符完整相等。
- `service/beatmcp/server_test.go`：补入上轮本地验证过的匿名 search/inspect 与十种执行字段拒绝回归，没有改运行期处理。
- `service/beatmcp/AGENTS.md`：同步目录展示与回归边界。

982 个绑定值按 reference 比较完整相等，仅键名随 11 个工具名迁移。所有 input/output Schema、默认值、条件、枚举、annotations、OAuth scopes、schemaHash、模式和读取引用不变；原 REST、本地三工具、执行链、价格/计费、任务归属、UI HTML 与共享指引没有改动。旧缓存技术名需要重新发现，不增加别名工具来扩大 986 集合。

本轮重新通过完整 MCP race 回归（显式载入新目录和真实 SDK 分页）、三项隔离 router 回归、17 项展示/保真测试和 diff 检查。上轮相同展示源码的完整 67 主测试/16 Harness 证据另见本地核实报告；不把本轮定向复验声称为全仓库测试。正式 Docker 构建及蓝绿健康门禁通过。

## 同一草稿更新方式

保留插件 `plugin_asdk_app_6aed1b32cb0c81919339954cee14a350`、关联 app、beatapi key、正式 endpoint、beatapi-chatgpt OAuth 客户端及原 0.4.0 草稿。

先下载当前公开 ZIP，核对 5 个正向、3 个负向案例及 MCP 配置；所有案例工具名都在新目录中，没有涉及本轮 11 个改名对象，因此 **ZIP 本身无需修改或重复上传**。通过同一草稿 Rescan 更新服务端工具定义，并核对保存的 986 个 action_name/title/description/input/output Schema 与候选相等。没有为了“更新”重复上传相同包或重置 attestations，也没有创建新插件、重连账户、读取安全字段中的审核凭证或代勾选声明。

扫描前后均有正式端点逐项读取；18:17:56 复验仍匹配修复目录，健康 200、域名验证 200。CLI 部署状态轮询曾网络超时，未重复部署；重新查询确认同一运行 success，并从日志确认精确上线 SHA。

## 本轮正式扫描

- 只点击一次 Rescan。
- scan：`asdk_app_6aed1b32cb0c81919339954cee14a350~AppsSDKContinuousScan_7e928a413dec81918ed3e2b6171d206c`。
- attempt：`01a1bfca-7eda-7727-b226-c7dacc0f5cfd`。
- scan_time：18:14:00；completedAt：18:15:09。
- 全部 986 工具和共享指引 complete，problem=null；没有 unknown，门户定义与部署候选无差异。

原 12 项具体反馈清除，但 capabilities_search、capabilities_inspect 的“可能执行未单独暴露操作”指控仍存在。既有只读控制流和新增负向 SDK 回归依据继续有效，见 MCP-DISCOVERY-REVIEW-NOTE-2026-11-09.md；没有通过改权限、删工具或修改参数来规避它。

另外六项是本轮新标记、尚未在本轮继续改动的名称/说明问题：

| reference | 反馈 |
| --- | --- |
| data:bilibili.huahuo.popular_avid_list | 名称不清 |
| data:lemon8.app.fetch_search | 说明不清 |
| data:pipixia.app.fetch_search | 说明不清 |
| data:xiaohongshu.pgy.get_content_square | 名称不清 |
| data:zhihu.web.fetch_salt_search_v3 | 名称不清 |
| data:zhihu.web.fetch_user_segments | 名称不清 |

它们是扫描反馈，不自动等于运行故障或权限问题，须按实际契约继续核实。497 条通用提示单独计数，不混同八条具体反馈。正式扫描再次证明独立诊断零具体反馈不能替代正式草稿结果。

本轮止于这版修复的正式上线与重扫，没有继续修改上述六项、自动申诉、运行付费案例或提交审核。完整名单与原文在 comparison.json；本轮终态来自页面当前 appContinuousReview 查询数据，只保存该 app 的扫描数据，不导出认证上下文。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
