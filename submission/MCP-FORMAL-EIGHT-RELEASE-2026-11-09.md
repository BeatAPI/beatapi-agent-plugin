# 累计八项展示修复正式发布与复扫

> 2026-11-09，北京时间。用户授权先备份、确认回滚，再发布累计八项展示修复并更新同一正式草稿；不提交审核。

后续：Instagram 两项说明已在 `19ef64b10` 修复并发布，最新 22:34 正式结果见 `MCP-INSTAGRAM-FINAL-2026-11-09.md`。本文件保留此前发布及再次扫描的原始事实，不代表最新剩余反馈。

## 发布与边界

提交 `243229fdf1170cb7c712b8ba7620181f49832dbb` 已推送 main，基线为此前成功部署的 `1dcbae3a8e7eb3d36c4b90f692922c947daeeb1b`。本轮仅提交 `service/beatmcp/catalog_default.json` 和模块 `AGENTS.md`，保留单空格 JSON 格式。[部署工作流 42625084970](https://github.com/fengshao1227/beat-new-api/actions/runs/42625084970) 于 21:36:09 成功结束，耗时 12 分 24 秒；精确提交服务检查及 Craft 路由检查均成功。

四项抖音媒体链接/分享修复与四项星图研究修复一起发布：八项 name/title/description 和八个绑定键名变化，其余 978 个 SDK 描述符不变。保持 **986 工具、982 固定执行绑定**；所有绑定值、input/output Schema、默认值、枚举、nullable、required、边界、additionalProperties、annotations、OAuth scopes、schemaHash、执行模式、历史读取枚举、共享指引和 UI 不变。

没有修改运行代码、数据库、OAuth、价格、计费、任务归属、原 REST 或本地工具。八个旧技术名不提供自动别名，客户端须刷新发现结果。此前批准的两个公开目录排除项不变。

## 备份、回滚与验证

本轮证据在 `artifacts/mcp-formal-eight-release-20261109/`：

- `catalog-before.json`：发布前内置目录逐字备份，SHA256 `655d180c7908a7430c778ad123079bc6dbf4ce6e996349c29c3369ca227fd1d2`。
- `result-schema-before.json`：未改动的结果声明，SHA256 `225091fad6e7cd31bc81275de0569af3d28b926c5f78577a8b7d3a08b0ab6141`。
- 两份备份与基线 Git 对象相等，发布前线上完整目录/指引/UI 与上一正式版本相等。`rollback.patch` 反向检查通过；未实际回滚。
- 回滚基于最新 main 只 revert `243229fdf`，通过既有蓝绿部署，再核对旧目录并重扫同一草稿；不得 reset/强推或撤销其他修复。没有数据库迁移，详见 `ROLLBACK.md`。
- 本轮 20 项展示回归、完整 MCP race、三项隔离 router race、diff 检查均通过。原后端工作区五项未提交改动保持原样；发布来自独立干净 worktree。
- 正式十页读取全部 986 描述符、共享指引与最新独立候选逐项相等；资源及 HTML 与发布前相等，公共健康和域名验证均 200。初次读回仍是部署前目录，之后遇到 TLS/连接超时，只重试匿名元数据，没有执行工具或重复部署。

## 同一正式草稿

保留 `plugin_asdk_app_6aed1b32cb0c81919339954cee14a350`、原 app、beatapi MCP key、正式 endpoint、`beatapi-chatgpt` OAuth 和 0.4.0 草稿。展示与 Skill 不涉及这八个旧技术名，因此无需重复上传相同 ZIP；MCP 扫描刷新服务端定义，不重置账户或声明。

本轮两次原生 ZIP 下载等待超时，未取得新 ZIP，不冒充新备份。改为复核上一轮已下载的同一草稿包：5 正向/3 负向案例中的工具均存在，Skill/包不引用八个旧名，MCP 配置一致。证据明确记录其来源为上一轮备份。

浏览器控制权曾交给用户；用户允许继续后，观察到同一正式草稿已有新扫描运行，故没有再次点击 Rescan。保存该运行并等待，不推断其具体触发者。

## 正式扫描结果

- scan：`asdk_app_6aed1b32cb0c81919339954cee14a350~AppsSDKContinuousScan_7d22a85db9d481918691173117d32ab3`。
- attempt：`01a1c082-7fd4-79e1-adac-88181791e3ea`；scan_time 21:35:26，完成于 21:36:29。
- **986/986 complete**，problem=null、activeRun=null，没有 unknown；共享指引 complete 且无 findings。
- 本轮八项目标的具体反馈全部消失；其中七项全部 findings 为空，批量播放链接工具保留一条通用复核提示。
- 全目录另有 **329 条通用进一步审核提示**，allToolsPass=null，不是审核通过。
- 其他六项具体反馈：四个 Douyin billboard high fan/like/search/topic 工具名称不清楚、Instagram V2/V3 general_search 说明不清楚。
- `capabilities_inspect` 再次被标记疑似执行未单独公开的操作；`capabilities_search` 只有通用提示。发现工具定义本轮未变，先保留既有只读/独立执行绑定证据，不能凭历史结果宣称已获豁免。

七条非通用反馈对应的完整定义与发布前逐字段相等，见 `new-findings.json`；本轮未擅自继续修改或删能力。门户保存的全 986 个 action_name/title/description、input/output Schema、annotations、认证声明及共享指引均与最新冻结候选相等，不是旧扫描结果。

浏览器等待函数超时后重新读取当前状态，确认该 attempt 已正常完成；没有因等待超时重复扫描。门户保持 Configured / Authorized / Domain verified / Not submitted / Not published。未读取安全审核登录字段，未提交审核、申诉或发布。

扫描后额外启动的一轮匿名重复读回长时间未完成，已中断，不声称该轮通过；`post-scan-health.json` 仅记录未完成状态。上线后的完整生产读回已通过，门户扫描后的全量保存定义也已逐项通过，不因额外复验等待而重复部署或重扫。

## 用户要求再次正式扫描，22:16

未修改目录、包或正式配置，仅在同一 0.4.0 草稿点击一次 Rescan。最新结果由 OpenAI 门户直接保存，无需另行上传扫描报告；没有重复上传相同 ZIP 或重置声明/审核账号。

- scan：`asdk_app_6aed1b32cb0c81919339954cee14a350~AppsSDKContinuousScan_5baf362897048191b2ce26af64afb67d`。
- attempt：`01a1c0a7-22c4-7d0f-b95d-03a92173ac29`，完成于 22:16:20。
- 986/986 complete，共享指引 complete 且无反馈，problem=null、activeRun=null。
- 全部工具 definition 与上一轮逐字段相等；所有参数、权限和共享指引未变。八项修复仍无具体反馈，其中批量播放链接工具仍有一条通用提示。
- 本轮仅余两条具体 fail：Instagram V2/V3 general_search 说明不清楚。此前四条 billboard 名称反馈和 inspect 的隐藏执行指控均未再出现；因为未改定义，此差异是本轮观察，不能证明问题已被代码修复。
- 通用复核提示 158 条，allToolsPass=null，MCP 仍显示 Needs attention。不能宣称审核通过或所有问题已清空。
- Metadata 无反馈、Skill Checks passed，Submit for review 按钮未禁用，但没有点击；按钮可点击不等于送审条件全部验证通过。最后提交动作保留给用户。

本轮独立保存 `rerun-before.json`、`rerun-start.json`、`rerun-after.json`、`rerun-comparison.json`、`rerun-state.txt` 和只读离线对照脚本，不覆盖上一轮原始结果。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
